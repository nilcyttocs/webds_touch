import { ReactWidget } from '@jupyterlab/apputils';
import React, { useState, useEffect } from 'react';

import CircularProgress from '@mui/material/CircularProgress';

import { TouchMui } from './widget_mui';

import { requestAPI } from './handler';

const TouchContainer = (props: any): JSX.Element => {
  const [dimensions, setDimensions] = useState<any>([]);

  const getDeviceInfo = async () => {
    try {
      const data = await requestAPI<any>('command?query=app-info');
      if (data.maxX && data.maxY) {
        setDimensions([data.maxX, data.maxY]);
      }
    } catch (error) {
      console.error(`Error - GET /webds/command?query=app-info\n${error}`);
    }
  };

  useEffect(() => {
    getDeviceInfo();
  }, []);

  return (
    <div>
      {dimensions.length ? (
        <TouchMui maxX={dimensions[0]} maxY={dimensions[1]}/>
      ) : (
        <div style={{marginLeft: 200, marginTop: 200}}>
          <CircularProgress color='primary'/>
        </div>
      )}
    </div>
  );
};

export class TouchWidget extends ReactWidget {
  render(): JSX.Element {
    return (
      <div className='jp-webdsTouch-container'>
        <TouchContainer/>
      </div>
    );
  }
};
