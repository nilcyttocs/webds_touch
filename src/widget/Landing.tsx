import React, { useState } from "react";

import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";

import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";

import TouchLive from "./touch_plots/TouchLive";

import {
  MIN_WIDTH,
  PLOT_HEIGHT,
  TABLE_WIDTH,
  TABLE_HEIGHT,
  TABLE_SPACING,
  VIRIDIS_COLORS,
  LINEARITY_TOOLTIP
} from "./constants";

import { Canvas } from "./mui_extensions/Canvas";
import { Content } from "./mui_extensions/Content";
import { Controls } from "./mui_extensions/Controls";

import {
  FlipToggle,
  PauseRunToggle,
  ResetButton,
  TouchViewToggle
} from "./mui_extensions/Button";

type Flip = {
  h: boolean;
  v: boolean;
};

const positionDataEntries = ["x", "y", "z", "wx", "wy"];

const traceDataEntries = ["range x", "range y", "linearity"];

const convertReportType = (viewType: string) => {
  switch (viewType) {
    case "Position Data":
      return "position";
    case "Trace Data":
      return "trace";
    default:
      return undefined;
  }
};

export const Landing = (props: any): JSX.Element => {
  const [plotReady, setPlotReady] = useState<boolean>(false);
  const [run, setRun] = useState<boolean>(true);
  const [flip, setFlip] = useState<Flip>({ h: false, v: false });
  const [viewType, setViewType] = useState<string>("Position Data");
  const [clearPlot, setClearPlot] = useState<boolean>(false);
  const [stats, setStats] = useState<number[][]>(
    [...Array(10)].map((e) => Array(5))
  );

  const updateStats = (stats: number[][]) => {
    setStats(stats);
  };

  const generateTable = (obj: number): JSX.Element => {
    return (
      <TableContainer
        key={obj}
        component={Paper}
        sx={{ width: TABLE_WIDTH + "px", height: TABLE_HEIGHT + "px" }}
      >
        {viewType === "Position Data" ? (
          <Table size="small" sx={{ width: TABLE_WIDTH + "px" }}>
            <TableBody>
              <TableRow>
                {obj >= 5 ? (
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{
                      color: "black",
                      backgroundColor: VIRIDIS_COLORS[obj]
                    }}
                  >
                    Finger {obj}
                  </TableCell>
                ) : (
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{
                      color: "white",
                      backgroundColor: VIRIDIS_COLORS[obj]
                    }}
                  >
                    Finger {obj}
                  </TableCell>
                )}
              </TableRow>
              {positionDataEntries.map((dataEntry, index) => (
                <TableRow key={index}>
                  <TableCell>{dataEntry}</TableCell>
                  <TableCell align="right">{stats[obj][index]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table size="small" sx={{ width: TABLE_WIDTH + "px" }}>
            <TableBody>
              <TableRow>
                {obj >= 5 ? (
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{
                      color: "black",
                      backgroundColor: VIRIDIS_COLORS[obj]
                    }}
                  >
                    Finger {obj}
                  </TableCell>
                ) : (
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{
                      color: "white",
                      backgroundColor: VIRIDIS_COLORS[obj]
                    }}
                  >
                    Finger {obj}
                  </TableCell>
                )}
              </TableRow>
              {traceDataEntries.map((dataEntry, index) => (
                <TableRow key={index}>
                  {dataEntry === "linearity" && stats[obj][index] ? (
                    <Tooltip title={LINEARITY_TOOLTIP}>
                      <TableCell>{dataEntry}</TableCell>
                    </Tooltip>
                  ) : (
                    <TableCell>{dataEntry}</TableCell>
                  )}
                  <TableCell align="right">{stats[obj][index]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    );
  };

  const generateTopRow = (): JSX.Element => {
    let row = [];

    for (let i = 0; i < 5; i++) {
      row.push(generateTable(i));
    }

    return (
      <Stack spacing={TABLE_SPACING} direction="row">
        {row}
      </Stack>
    );
  };

  const generateBottomRow = (): JSX.Element => {
    let row = [];

    for (let i = 5; i < 10; i++) {
      row.push(generateTable(i));
    }

    return (
      <Stack spacing={TABLE_SPACING} direction="row">
        {row}
      </Stack>
    );
  };

  return (
    <Canvas
      title={viewType === "" ? "Touch Data" : viewType}
      minWidth={MIN_WIDTH}
    >
      <Content
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {viewType !== "" && (
          <div style={{ display: "flex", gap: "24px" }}>
            <TouchLive
              length={PLOT_HEIGHT}
              portrait={true}
              flip={flip}
              viewType={convertReportType(viewType)}
              appInfo={props.appInfo}
              run={run}
              clearPlot={clearPlot}
              updateStats={updateStats}
              setPlotReady={setPlotReady}
            />
            {plotReady && (
              <Stack spacing={TABLE_SPACING}>
                {generateTopRow()}
                {generateBottomRow()}
              </Stack>
            )}
          </div>
        )}
      </Content>
      <Controls
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <div style={{ display: "flex", gap: "16px" }}>
          {viewType === "Position Data" ? (
            <PauseRunToggle
              running={run}
              disabled={!viewType}
              onClick={() => {
                setRun(!run);
              }}
            />
          ) : (
            <ResetButton
              tooltip="Clear Traces"
              disabled={!viewType}
              onClick={() => {
                setClearPlot(!clearPlot);
              }}
            />
          )}
          <TouchViewToggle
            traceView={viewType === "Trace Data"}
            disabled={!viewType}
            onClick={() => {
              setViewType((prev) =>
                prev === "Position Data" ? "Trace Data" : "Position Data"
              );
            }}
          />
          <FlipToggle
            horizontal={false}
            flip={flip.v}
            disabled={!viewType}
            onClick={() => {
              setFlip((prev) => {
                const updated = { ...prev };
                updated.v = !updated.v;
                return updated;
              });
            }}
          />
          <FlipToggle
            horizontal={true}
            flip={flip.h}
            disabled={!viewType}
            onClick={() => {
              setFlip((prev) => {
                const updated = { ...prev };
                updated.h = !updated.h;
                return updated;
              });
            }}
          />
        </div>
      </Controls>
    </Canvas>
  );
};

export default Landing;
