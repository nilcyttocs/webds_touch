import React, { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';

import {
  ALERT_MESSAGE_ADD_PRIVATE_CONFIG_JSON,
  ALERT_MESSAGE_ADD_PUBLIC_CONFIG_JSON,
  ALERT_MESSAGE_APP_INFO
} from './constants';
import Landing from './Landing';
import { requestAPI, webdsService } from './local_exports';

let alertMessage = '';

export const TouchComponent = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [appInfo, setAppInfo] = useState<any>();

  const webdsTheme = webdsService.ui.getWebDSTheme();

  const showAlert = (message: string) => {
    alertMessage = message;
    setAlert(true);
  };

  const initialize = async () => {
    const external = webdsService.pinormos.isExternal();
    try {
      if (external) {
        await webdsService.packrat.cache.addPublicConfig();
      } else {
        await webdsService.packrat.cache.addPrivateConfig();
      }
    } catch (error) {
      console.error(error);
      if (external) {
        showAlert(ALERT_MESSAGE_ADD_PUBLIC_CONFIG_JSON);
      } else {
        showAlert(ALERT_MESSAGE_ADD_PRIVATE_CONFIG_JSON);
      }
      return;
    }
    const dataToSend: any = {
      command: 'getAppInfo'
    };
    try {
      const response = await requestAPI<any>('command', {
        body: JSON.stringify(dataToSend),
        method: 'POST'
      });
      setAppInfo(response);
    } catch (error) {
      console.error(`Error - POST /webds/command\n${dataToSend}\n${error}`);
      showAlert(ALERT_MESSAGE_APP_INFO);
      return;
    }
    setInitialized(true);
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <ThemeProvider theme={webdsTheme}>
        <div className="jp-webds-widget-body">
          {alert && (
            <Alert
              severity="error"
              onClose={() => setAlert(false)}
              sx={{ whiteSpace: 'pre-wrap' }}
            >
              {alertMessage}
            </Alert>
          )}
          {initialized && <Landing appInfo={appInfo} />}
        </div>
        {!initialized && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <CircularProgress color="primary" />
          </div>
        )}
      </ThemeProvider>
    </>
  );
};

export default TouchComponent;
