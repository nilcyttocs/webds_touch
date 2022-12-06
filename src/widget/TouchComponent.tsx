import React, { useEffect, useState } from "react";

import Alert from "@mui/material/Alert";

import CircularProgress from "@mui/material/CircularProgress";

import { ThemeProvider } from "@mui/material/styles";

import Landing from "./Landing";

import {
  ALERT_MESSAGE_APP_INFO,
  ALERT_MESSAGE_ADD_PUBLIC_CONFIG_JSON,
  ALERT_MESSAGE_ADD_PRIVATE_CONFIG_JSON
} from "./constants";

import { requestAPI } from "../handler";

let alertMessage = "";

export const TouchComponent = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<any>([]);

  const showAlert = (message: string) => {
    alertMessage = message;
    setAlert(true);
  };

  const initialize = async () => {
    const external = props.service.pinormos.isExternal();
    try {
      if (external) {
        await props.service.packrat.cache.addPublicConfig();
      } else {
        await props.service.packrat.cache.addPrivateConfig();
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
      command: "getAppInfo"
    };
    try {
      const response = await requestAPI<any>("command", {
        body: JSON.stringify(dataToSend),
        method: "POST"
      });
      if (response.maxX && response.maxY) {
        setDimensions([response.maxX, response.maxY]);
      }
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

  const webdsTheme = props.service.ui.getWebDSTheme();

  return (
    <>
      <ThemeProvider theme={webdsTheme}>
        <div className="jp-webds-widget-body">
          {alert && (
            <Alert
              severity="error"
              onClose={() => setAlert(false)}
              sx={{ whiteSpace: "pre-wrap" }}
            >
              {alertMessage}
            </Alert>
          )}
          {initialized && <Landing maxX={dimensions[0]} maxY={dimensions[1]} />}
        </div>
        {!initialized && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
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
