import React, { useState, useEffect } from 'react';

import Fab from '@mui/material/Fab';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import FormControl from '@mui/material/FormControl';
import { ThemeProvider } from '@mui/material/styles';

import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';

import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import TouchPlot from './touch_component';

import webdsTheme from './webds_theme';

const PLOT_HEIGHT = 500;

const TABLE_SPACE = 2;
const TABLE_WIDTH = 160;
const TABLE_HEIGHT = 240;

const SELECT_WIDTH = 200;

const viewTypes = [
  'Position Data',
  'Trace Data'
];

const positionDataEntries = [
  'x',
  'y',
  'z',
  'wx',
  'wy'
];

const traceDataEntries = [
  'range x',
  'range y',
  'linearity'
];

const viridisColors = [
  '#440154',
  '#482878',
  '#3E4A89',
  '#31688E',
  '#26828E',
  '#1F9E89',
  '#35B779',
  '#6ECE58',
  '#B5DE2B',
  '#FDE725'
];

const snackMessage = 'Failed to retrieve touch reports. \
  Please check in file browser in left sidebar and ensure private config JSON file placed in Packrat directory \
  (e.g. /Packrat/1234567/config_private.json for PR1234567).';

const linearityTooltip = 'max error to line of best fit in x/y axis units';

export const TouchMui = (props: any): JSX.Element => {
  const [run, setRun] = useState<boolean>(true);
  const [viewType, setViewType] = useState<string>('Position Data');
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [clearPlot, setClearPlot] = useState<boolean>(false);
  const [stats, setStats] = useState<number[][]>([...Array(10)].map(e => Array(5)));
  const [snack, setSnack] = useState<boolean>(false);
  const [inputWidth, setInputWidth] = useState<number>(0);

  let plotWidth = Math.floor(PLOT_HEIGHT * props.maxX / props.maxY);
  plotWidth += TABLE_WIDTH * 5;
  plotWidth += 5 * 8;
  plotWidth += TABLE_SPACE * 4 * 8;

  const resetViewType = () => {
    setViewType('');
    setRun(false);
  };

  const changeViewType = (event: any) => {
    if (viewType !== event.target.value) {
      setViewType(event.target.value);
      if (event.target.value) {
        setRun(true);
      }
    }
  };

  const updateShowInfo = (show: boolean) => {
    setShowInfo(show);
  };

  const triggerClearPlot = () => {
    setClearPlot(!clearPlot);
  };

  const updateStats = (stats: number[][]) => {
    setStats(stats);
  };

  const openSnackBar = () => {
    setSnack(true);
  };

  const generateTable = (obj: number): JSX.Element => {
    return (
      <TableContainer
        component={Paper}
        sx={{width: TABLE_WIDTH + 'px', height: TABLE_HEIGHT + 'px'}}
      >
        {viewType === 'Position Data' ? (
          <Table
            size='small'
            sx={{width: TABLE_WIDTH + 'px'}}
          >
            <TableRow>
              {obj >= 5 ? (
                <TableCell
                  colSpan={2}
                  align='center'
                  sx={{color: 'black', backgroundColor: viridisColors[obj]}}
                >
                  Finger {obj}
                </TableCell>
              ) : (
                <TableCell
                  colSpan={2}
                  align='center'
                  sx={{color: 'white', backgroundColor: viridisColors[obj]}}
                >
                  Finger {obj}
                </TableCell>
              )}
            </TableRow>
            {positionDataEntries.map((dataEntry, index) => (
              <TableRow>
                <TableCell>{dataEntry}</TableCell>
                <TableCell align='right'>{stats[obj][index]}</TableCell>
              </TableRow>
            ))}
          </Table>
        ) : (
          <Table
            size='small'
            sx={{width: TABLE_WIDTH + 'px'}}
          >
            <TableRow>
              {obj >= 5? (
                <TableCell
                  colSpan={2}
                  align='center'
                  sx={{color: 'black', backgroundColor: viridisColors[obj]}}
                >
                  Finger {obj}
                </TableCell>
              ) : (
                <TableCell
                  colSpan={2}
                  align='center'
                  sx={{color: 'white', backgroundColor: viridisColors[obj]}}
                >
                  Finger {obj}
                </TableCell>
              )}
            </TableRow>
            {traceDataEntries.map((dataEntry, index) => (
              <TableRow>
                {dataEntry === 'linearity' && stats[obj][index] ? (
                  <Tooltip title={linearityTooltip}>
                    <TableCell>{dataEntry}</TableCell>
                  </Tooltip>
                ) : (
                  <TableCell>{dataEntry}</TableCell>
                )}
                <TableCell align='right'>{stats[obj][index]}</TableCell>
              </TableRow>
            ))}
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
      <Stack
        spacing={TABLE_SPACE}
        direction='row'
      >
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
      <Stack
        spacing={TABLE_SPACE}
        direction='row'
      >
        {row}
      </Stack>
    );
  };

  useEffect(() => {
    let text = document.getElementById('viewTypeText');
    if (text) {
      text.style.fontSize = '18px';
      setInputWidth(text.clientWidth + 8 + SELECT_WIDTH + 80 + 40);
    }
  }, []);

  return (
    <ThemeProvider theme={webdsTheme}>
      <div>
        <Stack
          spacing={5}
          divider={<Divider orientation='horizontal' sx={{width: inputWidth + 'px'}}/>}
          sx={{marginLeft: '50px', marginTop: '50px'}}
        >
          <div>
            <div style={{height: '50px'}}>
              {showInfo ? (
                <div style={{width: plotWidth + 'px', fontSize: '20px', textAlign: 'center', whiteSpace: 'nowrap'}}>
                  {viewType}
                </div>
              ) : (
                null
              )}
            </div>
            <Stack
              spacing={5}
              direction='row'
            >
              <TouchPlot
                run={run}
                maxX={props.maxX}
                maxY={props.maxY}
                viewType={viewType}
                clearPlot={clearPlot}
                plotHeight={PLOT_HEIGHT}
                inputWidth={inputWidth}
                resetViewType={resetViewType}
                updateShowInfo={updateShowInfo}
                updateStats={updateStats}
                openSnackBar={openSnackBar}
              />
              {showInfo ? (
                <Stack
                  spacing={TABLE_SPACE}
                >
                  {generateTopRow()}
                  {generateBottomRow()}
                </Stack>
              ) : (
                null
              )}
            </Stack>
          </div>
          <Stack
            spacing={10}
            direction='row'
            sx={{height: '70px'}}
          >
            <Stack
              spacing={1}
              direction='row'
            >
              <div id='viewTypeText' style={{paddingTop: '8px', fontSize: '18px', whiteSpace: 'nowrap'}}>
                View Type
              </div>
              <FormControl
                size='small'
                sx={{minWidth: SELECT_WIDTH + 'px', maxWidth: SELECT_WIDTH + 'px'}}>
                <Select
                  displayEmpty
                  value={viewType}
                  onChange={changeViewType}
                  renderValue={(selected: any) => {
                    if (selected.length === 0) {
                      return (
                        <div style={{color: 'grey'}}>
                          <em>Please Select</em>
                        </div>
                      );
                    }
                    return selected;
                  }}
                >
                  {viewTypes.map((viewType) => (
                    <MenuItem
                      key={viewType}
                      value={viewType}
                    >
                      {viewType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
              {viewType === '' ? (
                <Fab
                  disabled
                  onClick={() => {setRun(true);}}
                >
                  <PlayArrowIcon/>
                </Fab>
              ) : (
                viewType === 'Position Data' ? (
                  run === false ? (
                    <Fab
                      onClick={() => {setRun(true);}}
                    >
                      <PlayArrowIcon/>
                    </Fab>
                  ) : (
                    <Fab
                      onClick={() => {setRun(false);}}
                    >
                      <StopIcon/>
                    </Fab>
                  )
                ) : (
                  <Fab
                    onClick={() => {triggerClearPlot();}}
                  >
                    <RestartAltIcon/>
                  </Fab>
                )
              )}
          </Stack>
        </Stack>
        <Snackbar
          open={snack}
          autoHideDuration={7000}
          anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
          message={snackMessage}
          onClose={() => setSnack(false)}
        />
      </div>
    </ThemeProvider>
  );
};
