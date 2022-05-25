import React, { useEffect, useRef, useState } from "react";

import Plot from "react-plotly.js";

import { requestAPI } from "./handler";

const SSE_CLOSED = 2;

const REPORT_TOUCH = 17;
const REPORT_DELTA = 18;
const REPORT_RAW = 19;

const REPORT_FPS = 120;

const RENDER_FPS = 60;
const RENDER_INTERVAL = 1000 / RENDER_FPS;

const viridisColors = [
  "#440154",
  "#482878",
  "#3E4A89",
  "#31688E",
  "#26828E",
  "#1F9E89",
  "#35B779",
  "#6ECE58",
  "#B5DE2B",
  "#FDE725"
];

let run = false;
let viewType = "";

let xTrace: number[][];
let yTrace: number[][];
let traceStats: number[][];
let traceStatus: string[];

let eventSource: EventSource | undefined = undefined;
let eventData: any = undefined;
let eventError = false;

const computeLinearity = (index: number, length: number): number => {
  const xSum = xTrace[index].reduce((a, b) => a + b, 0);
  const xSumSquared = xSum * xSum;
  const xMean = xSum / length;
  const xSquared = xTrace[index].map((e) => e * e);
  const xSquaredSum = xSquared.reduce((a, b) => a + b, 0);

  const ySum = yTrace[index].reduce((a, b) => a + b, 0);
  const yMean = ySum / length;

  const xySum = xTrace[index].reduce((a, b, i) => a + b * yTrace[index][i], 0);

  /* Coefficients for equation of line best fit (Ax + By + C = 0) */
  const A =
    (xySum - (xSum * ySum) / length) / (xSquaredSum - xSumSquared / length);
  const B = -1;
  const C = yMean - A * xMean;

  let linearity = 0;
  const denominator = Math.sqrt(A * A + B * B);

  for (let i = 0; i < length; i++) {
    const distance =
      Math.abs(A * xTrace[index][i] + B * yTrace[index][i] + C) / denominator;
    linearity = distance > linearity ? distance : linearity;
  }

  linearity = Math.round(linearity * 1e1) / 1e1;

  return linearity;
};

const captureTraces = () => {
  let pos = eventData.pos;
  if (pos === undefined) {
    pos = [];
  }

  for (let i = 0; i < 10; i++) {
    if (traceStatus[i] === "+") {
      traceStatus[i] = "-";
    }
  }

  for (let i = 0; i < pos.length; i++) {
    const obj = pos[i];
    const index = obj.objectIndex;

    if (traceStatus[index] === "*") {
      xTrace[index] = [obj.xMeas];
      yTrace[index] = [obj.yMeas];
      traceStats[index] = Array(7);
    } else {
      xTrace[index].push(obj.xMeas);
      yTrace[index].push(obj.yMeas);
    }
    traceStatus[index] = "+";

    if (
      traceStats[index][0] === undefined ||
      obj.xMeas < traceStats[index][0]!
    ) {
      traceStats[index][0] = obj.xMeas;
    }
    if (
      traceStats[index][1] === undefined ||
      obj.xMeas > traceStats[index][1]!
    ) {
      traceStats[index][1] = obj.xMeas;
    }
    if (
      traceStats[index][2] === undefined ||
      obj.yMeas < traceStats[index][2]!
    ) {
      traceStats[index][2] = obj.yMeas;
    }
    if (
      traceStats[index][3] === undefined ||
      obj.yMeas > traceStats[index][3]!
    ) {
      traceStats[index][3] = obj.yMeas;
    }
  }

  for (let i = 0; i < 10; i++) {
    if (traceStatus[i] === "-") {
      traceStatus[i] = "*";
      if (traceStats[i][0] !== undefined && traceStats[i][1] !== undefined) {
        traceStats[i][4] = traceStats[i][1]! - traceStats[i][0]!;
      }
      if (traceStats[i][2] !== undefined && traceStats[i][3] !== undefined) {
        traceStats[i][5] = traceStats[i][3]! - traceStats[i][2]!;
      }
      traceStats[i][6] = computeLinearity(i, xTrace[i].length);
    }
  }
};

const eventHandler = (event: any) => {
  const data = JSON.parse(event.data);
  if (!data || !data.report || data.report[0] !== "position") {
    return;
  }

  eventData = data.report[1];

  if (viewType === "Trace Data") {
    captureTraces();
  }
};

const removeEvent = () => {
  if (eventSource && eventSource.readyState !== SSE_CLOSED) {
    eventSource.removeEventListener("report", eventHandler, false);
    eventSource.close();
    eventSource = undefined;
  }
};

const errorHandler = (error: any) => {
  eventError = true;
  removeEvent();
  console.error(`Error on GET /webds/report\n${error}`);
};

const addEvent = () => {
  if (eventSource) {
    return;
  }
  eventError = false;
  eventSource = new window.EventSource("/webds/report");
  eventSource.addEventListener("report", eventHandler, false);
  eventSource.addEventListener("error", errorHandler, false);
};

const setReport = async (
  disable: number[],
  enable: number[]
): Promise<void> => {
  const dataToSend = { enable, disable, fps: REPORT_FPS };
  try {
    await requestAPI<any>("report", {
      body: JSON.stringify(dataToSend),
      method: "POST"
    });
    addEvent();
  } catch (error) {
    console.error("Error - POST /webds/report");
    return Promise.reject("Failed to enable/disable report types");
  }
  return Promise.resolve();
};

const TouchPlot = (props: any): JSX.Element => {
  const [showPlot, setShowPlot] = useState<boolean>(false);
  const [data, setData] = useState<any>([]);
  const [config, setConfig] = useState<any>({});
  const [layout, setLayout] = useState<any>({});
  const [frames, setFrames] = useState<any>([]);

  const plot_bgcolor = "black";
  const paper_bgcolor = "rgba(0, 0, 0, 0)";
  const axis_linecolor = "rgba(128, 128, 128, 0.5)";

  const l = 2;
  const r = 2;
  const t = 2;
  const b = 2;
  const width = props.plotWidth;
  const height = props.plotHeight;

  const plotConfig = { displayModeBar: false };

  let pos: any;
  let t0: number;
  let t1: number;
  let tThen: number;
  let frameCount: number;
  let requestID: number | undefined;

  const storeState = (figure: any) => {
    setData(figure.data);
    setLayout(figure.layout);
    setFrames(figure.frames);
    setConfig(figure.config);
  };

  const stopAnimation = () => {
    if (requestID) {
      cancelAnimationFrame(requestID);
      requestID = undefined;
    }
  };

  const computePlot = () => {
    if (eventData === undefined) {
      pos = undefined;
      return;
    }
    if (eventData.pos === undefined) {
      pos = [];
      return;
    }
    pos = eventData.pos;
  };

  const generateMarkers = (x: number[][], y: number[][]): any => {
    const markers = [];

    for (let i = 0; i < 10; i++) {
      const marker = {
        x: x[i],
        y: y[i],
        mode: "markers+text",
        marker: { size: 35, color: viridisColors[i] },
        text: [i.toString()],
        textposition: "inside",
        textfont: { family: "Arial", color: "white", size: 18 },
        name: "Object " + i
      };
      if (i >= 5) {
        marker.textfont.color = "black";
      }
      markers.push(marker);
    }

    return markers;
  };

  const generateTraces = (): any => {
    const traces = [];

    for (let i = 0; i < 10; i++) {
      const trace = {
        x: xTrace[i],
        y: yTrace[i],
        mode: "lines",
        line: { shape: "linear", width: 5, color: viridisColors[i] },
        name: "Object " + i
      };
      traces.push(trace);
    }

    const dummyX: number[] = [];
    const dummyY: number[] = [];
    traces.push({ x: dummyX, y: dummyY });

    return traces;
  };

  const renderPlot = () => {
    const stats = [...Array(10)].map((e) => Array(5));

    if (viewType === "Position Data") {
      const x = [...Array(10)].map((e) => Array(1));
      const y = [...Array(10)].map((e) => Array(1));

      for (let i = 0; i < pos.length; i++) {
        const obj = pos[i];
        const index = obj.objectIndex;
        x[index][0] = obj.xMeas;
        y[index][0] = obj.yMeas;
        stats[index][0] = obj.xMeas;
        stats[index][1] = obj.yMeas;
        stats[index][2] = obj.z;
        stats[index][3] = obj.xWidth;
        stats[index][4] = obj.yWidth;
      }

      setData(generateMarkers(x, y));
    } else {
      for (let i = 0; i < 10; i++) {
        stats[i] = traceStats[i].slice(4);
      }

      setData(generateTraces());
    }

    props.updateStats(stats);

    setShowPlot(true);
    props.updateShowPlot(true);
  };

  const clearPlot = () => {
    pos = [];
    xTrace = [...Array(10)].map((e) => Array(1));
    yTrace = [...Array(10)].map((e) => Array(1));
    traceStats = [...Array(10)].map((e) => Array(7));
    traceStatus = [...Array(10)].map((e) => "*");
    renderPlot();
  };

  const animatePlot = () => {
    if (eventError) {
      props.resetViewType();
      return;
    }

    requestID = requestAnimationFrame(animatePlot);

    if (!run) {
      return;
    }

    const tNow = window.performance.now();
    const elapsed = tNow - tThen;

    if (elapsed <= RENDER_INTERVAL) {
      return;
    }

    tThen = tNow - (elapsed % RENDER_INTERVAL);

    computePlot();

    if (pos === undefined) {
      return;
    }

    renderPlot();

    frameCount++;
    t1 = Date.now();
    if (t1 - t0 >= 1000) {
      t0 = t1;
      console.log(`Touch FPS = ${frameCount}`);
      frameCount = 0;
    }
  };

  const startAnimation = () => {
    t0 = Date.now();
    frameCount = 0;
    eventData = undefined;
    tThen = window.performance.now();
    animatePlot();
  };

  const newPlot = async () => {
    viewType = props.viewType;
    if (!viewType) {
      setShowPlot(false);
      props.updateShowPlot(false);
      return;
    }
    setConfig(plotConfig);
    setLayout({
      width,
      height,
      margin: { l, r, t, b },
      plot_bgcolor,
      paper_bgcolor,
      xaxis: {
        range: [0, props.maxX],
        mirror: true,
        showline: true,
        linecolor: axis_linecolor,
        showticklabels: false
      },
      yaxis: {
        range: [0, props.maxY],
        mirror: true,
        showline: true,
        linecolor: axis_linecolor,
        showticklabels: false
      },
      showlegend: false
    });
    clearPlot();
    try {
      await setReport([REPORT_DELTA, REPORT_RAW], [REPORT_TOUCH]);
    } catch (error) {
      console.error(error);
      props.resetViewType();
      return;
    }
    startAnimation();
  };

  useEffect(() => {
    return () => {
      removeEvent();
    };
  }, []);

  useEffect(() => {
    run = props.run;
  }, [props.run]);

  useEffect(() => {
    newPlot();
    return () => {
      stopAnimation();
    };
  }, [props.viewType]);

  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    clearPlot();
  }, [props.clearPlot]);

  return (
    <div
      style={{ height: height + "px", display: "flex", alignItems: "center" }}
    >
      {showPlot ? (
        <Plot
          data={data}
          layout={layout}
          frames={frames}
          config={config}
          onInitialized={(figure) => storeState(figure)}
          onUpdate={(figure) => storeState(figure)}
        />
      ) : null}
    </div>
  );
};

export default TouchPlot;
