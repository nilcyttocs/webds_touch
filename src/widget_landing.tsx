import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";

import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";

import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import TouchPlot from "./touch_component";

type Lengths = {
  [length: string]: number;
};

const HEIGHT_TITLE = 70;
const HEIGHT_CONTENT = 500;
const HEIGHT_CONTROLS = 120;

const TABLE_SPACE = 2;
const TABLE_WIDTH = 160;
const TABLE_HEIGHT = 240;

const INPUT_WIDTH = 800;
const SELECT_WIDTH = 200;

const showHelp = false;

const viewTypes = ["Position Data", "Trace Data"];

const positionDataEntries = ["x", "y", "z", "wx", "wy"];

const traceDataEntries = ["range x", "range y", "linearity"];

const rotationAngles = [0, 90, 180, 270];

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

const linearityTooltip = "max error to line of best fit in x/y axis units";

export const Landing = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [run, setRun] = useState<boolean>(true);
  const [lengths, setLengths] = useState<Lengths>({});
  const [xFlip, setXFlip] = useState<string>("");
  const [yFlip, setYFlip] = useState<string>("");
  const [rotation, setRotation] = useState<string>("");
  const [angle, setAngle] = useState<number>(0);
  const [viewType, setViewType] = useState<string>("Position Data");
  const [showPlot, setShowPlot] = useState<boolean>(true);
  const [clearPlot, setClearPlot] = useState<boolean>(false);
  const [stats, setStats] = useState<number[][]>(
    [...Array(10)].map((e) => Array(5))
  );

  const handleAngleToggle = (
    event: React.MouseEvent<HTMLElement>,
    angle: number
  ) => {
    switch (angle) {
      case 0:
        setRotation(`rotate(${angle}deg) translate(0px, 0px)`);
        setLengths((prev) => ({
          ...prev,
          plotWidth: prev.plotXLength,
          totalWidth:
            prev.plotXLength +
            TABLE_WIDTH * 5 +
            5 * 8 +
            TABLE_SPACE * 4 * 8 +
            24 * 2
        }));
        break;
      case 90:
        setRotation(
          `rotate(${angle}deg) translate(0px, ${-lengths.plotYLength}px)`
        );
        setLengths((prev) => ({
          ...prev,
          plotWidth: prev.plotYLength,
          totalWidth:
            prev.plotYLength +
            TABLE_WIDTH * 5 +
            5 * 8 +
            TABLE_SPACE * 4 * 8 +
            24 * 2
        }));
        break;
      case 180:
        setRotation(
          `rotate(${angle}deg) translate(${-lengths.plotXLength}px, ${-lengths.plotYLength}px)`
        );
        setLengths((prev) => ({
          ...prev,
          plotWidth: prev.plotXLength,
          totalWidth:
            prev.plotXLength +
            TABLE_WIDTH * 5 +
            5 * 8 +
            TABLE_SPACE * 4 * 8 +
            24 * 2
        }));
        break;
      case 270:
        setRotation(
          `rotate(${angle}deg) translate(${-lengths.plotXLength}px, 0px)`
        );
        setLengths((prev) => ({
          ...prev,
          plotWidth: prev.plotYLength,
          totalWidth:
            prev.plotYLength +
            TABLE_WIDTH * 5 +
            5 * 8 +
            TABLE_SPACE * 4 * 8 +
            24 * 2
        }));
        break;
      default:
        break;
    }
    setAngle(angle);
  };

  const handleFlipCheckboxClick = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      if (event.target.id === "xFlip") {
        setXFlip("rotateX(180deg)");
      } else if (event.target.id === "yFlip") {
        setYFlip("rotateY(180deg)");
      }
    } else {
      if (event.target.id === "xFlip") {
        setXFlip("");
      } else if (event.target.id === "yFlip") {
        setYFlip("");
      }
    }
  };

  const resetViewType = () => {
    setViewType("");
    setRun(false);
  };

  const changeViewType = (event: any) => {
    if (viewType !== event.target.value) {
      setViewType(event.target.value);
      if (event.target.value) {
        setShowPlot(true);
        setRun(true);
      }
    }
  };

  const updateShowPlot = (show: boolean) => {
    setShowPlot(show);
  };

  const triggerClearPlot = () => {
    setClearPlot(!clearPlot);
  };

  const updateStats = (stats: number[][]) => {
    setStats(stats);
  };

  const generateToggleButtons = (): JSX.Element[] => {
    return rotationAngles.map((angle, index) => {
      return (
        <ToggleButton key={index} value={angle} sx={{ width: "50px" }}>
          <Typography variant="button">{angle}</Typography>
        </ToggleButton>
      );
    });
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
                    sx={{ color: "black", backgroundColor: viridisColors[obj] }}
                  >
                    Finger {obj}
                  </TableCell>
                ) : (
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{ color: "white", backgroundColor: viridisColors[obj] }}
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
                    sx={{ color: "black", backgroundColor: viridisColors[obj] }}
                  >
                    Finger {obj}
                  </TableCell>
                ) : (
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{ color: "white", backgroundColor: viridisColors[obj] }}
                  >
                    Finger {obj}
                  </TableCell>
                )}
              </TableRow>
              {traceDataEntries.map((dataEntry, index) => (
                <TableRow key={index}>
                  {dataEntry === "linearity" && stats[obj][index] ? (
                    <Tooltip title={linearityTooltip}>
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
      <Stack spacing={TABLE_SPACE} direction="row">
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
      <Stack spacing={TABLE_SPACE} direction="row">
        {row}
      </Stack>
    );
  };

  useEffect(() => {
    let height = HEIGHT_CONTENT;
    let width = Math.floor((HEIGHT_CONTENT * props.maxX) / props.maxY);
    if (width > height) {
      width = HEIGHT_CONTENT;
      height = Math.floor((HEIGHT_CONTENT * props.maxY) / props.maxX);
    }
    let total = width;
    total += TABLE_WIDTH * 5;
    total += 5 * 8;
    total += TABLE_SPACE * 4 * 8;
    total += 24 * 2;
    setLengths({
      plotXLength: width,
      plotYLength: height,
      plotWidth: width,
      totalWidth: total
    });
    setRotation("rotate(0deg) translate(0px, 0px)");
    setInitialized(true);
  }, [props.maxX, props.maxY]);

  return (
    <>
      {initialized ? (
        <Stack spacing={2}>
          <Box
            sx={{
              width: lengths.totalWidth + "px",
              height: HEIGHT_TITLE + "px",
              position: "relative",
              bgcolor: "section.main"
            }}
          >
            <Typography
              variant="h5"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)"
              }}
            >
              {viewType === "" ? "Touch Data" : viewType}
            </Typography>
            {showHelp && (
              <Button
                variant="text"
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "16px",
                  transform: "translate(0%, -50%)"
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ textDecoration: "underline" }}
                >
                  Help
                </Typography>
              </Button>
            )}
          </Box>
          <Box
            sx={{
              width: lengths.totalWidth + "px",
              height: HEIGHT_CONTENT + 24 * 2 + "px",
              position: "relative",
              bgcolor: "section.main",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {showPlot ? (
              <Stack spacing={5} direction="row">
                <div
                  style={{
                    transform: rotation,
                    transformOrigin: "top left",
                    minWidth: lengths.plotWidth,
                    maxWidth: lengths.plotWidth
                  }}
                >
                  <div
                    style={{
                      transform: xFlip,
                      transformOrigin: "center",
                      width: lengths.plotXLength,
                      height: lengths.plotYLength
                    }}
                  >
                    <div
                      style={{
                        transform: yFlip,
                        transformOrigin: "center",
                        width: lengths.plotXLength,
                        height: lengths.plotYLength
                      }}
                    >
                      <TouchPlot
                        run={run}
                        maxX={props.maxX}
                        maxY={props.maxY}
                        viewType={viewType}
                        clearPlot={clearPlot}
                        plotWidth={lengths.plotXLength}
                        plotHeight={lengths.plotYLength}
                        inputWidth={INPUT_WIDTH}
                        resetViewType={resetViewType}
                        updateShowPlot={updateShowPlot}
                        updateStats={updateStats}
                      />
                    </div>
                  </div>
                </div>
                <Stack spacing={TABLE_SPACE}>
                  {generateTopRow()}
                  {generateBottomRow()}
                </Stack>
              </Stack>
            ) : (
              <Typography
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)"
                }}
              >
                Please select view type
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: lengths.totalWidth + "px",
              minHeight: HEIGHT_CONTROLS + "px",
              position: "relative",
              bgcolor: "section.main",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <div style={{ margin: "24px 64px 24px 24px" }}>
              <Stack spacing={5} direction="row">
                <Stack spacing={1} direction="row">
                  <Typography sx={{ paddingTop: "10px" }}>View Type</Typography>
                  <FormControl
                    size="small"
                    sx={{
                      minWidth: SELECT_WIDTH + "px",
                      maxWidth: SELECT_WIDTH + "px"
                    }}
                  >
                    <Select
                      displayEmpty
                      value={viewType}
                      onChange={changeViewType}
                      renderValue={(selected: any) => {
                        if (selected.length === 0) {
                          return (
                            <div style={{ color: "grey" }}>
                              <em>Please Select</em>
                            </div>
                          );
                        }
                        return selected;
                      }}
                    >
                      {viewTypes.map((viewType, index) => (
                        <MenuItem key={index} value={viewType}>
                          {viewType}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
                {viewType === "" ? (
                  <Fab
                    disabled
                    onClick={() => {
                      setRun(true);
                    }}
                  >
                    <PlayArrowIcon />
                  </Fab>
                ) : viewType === "Position Data" ? (
                  run === false ? (
                    <Fab
                      onClick={() => {
                        setRun(true);
                      }}
                    >
                      <PlayArrowIcon />
                    </Fab>
                  ) : (
                    <Fab
                      onClick={() => {
                        setRun(false);
                      }}
                    >
                      <StopIcon />
                    </Fab>
                  )
                ) : (
                  <Fab
                    onClick={() => {
                      triggerClearPlot();
                    }}
                  >
                    <RestartAltIcon />
                  </Fab>
                )}
              </Stack>
            </div>
            <div style={{ margin: "24px 24px 24px 64px" }}>
              <Stack spacing={1}>
                <Stack spacing={1} direction="row">
                  <Typography sx={{ paddingTop: "10px" }}>
                    Plot Rotation
                  </Typography>
                  <ToggleButtonGroup
                    value={angle}
                    exclusive
                    onChange={handleAngleToggle}
                    sx={{ height: "40px" }}
                  >
                    {generateToggleButtons()}
                  </ToggleButtonGroup>
                </Stack>
                <Stack spacing={1} direction="row">
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="xFlip"
                        onChange={(event) => handleFlipCheckboxClick(event)}
                      />
                    }
                    label="X-Axis Flip"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="yFlip"
                        onChange={(event) => handleFlipCheckboxClick(event)}
                      />
                    }
                    label="Y-Axis Flip"
                  />
                </Stack>
              </Stack>
            </div>
          </Box>
        </Stack>
      ) : null}
    </>
  );
};