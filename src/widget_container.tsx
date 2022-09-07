import React, { useEffect, useState } from "react";

import { ReactWidget } from "@jupyterlab/apputils";

import Alert from "@mui/material/Alert";

import CircularProgress from "@mui/material/CircularProgress";

import { ThemeProvider } from "@mui/material/styles";

import { WebDSService } from "@webds/service";

import { Landing } from "./widget_landing";

import { requestAPI } from "./handler";

let alertMessage = "";

const alertMessagePublicConfigJSON =
  "Failed to retrieve config JSON file. Please check in file browser in left sidebar and ensure availability of config JSON file in /Packrat/ directory (e.g. /Packrat/1234567/config.json for PR1234567).";

const alertMessagePrivateConfigJSON =
  "Failed to retrieve config JSON file. Please check in file browser in left sidebar and ensure availability of config JSON file in /Packrat/ directory (e.g. /Packrat/1234567/config_private.json for PR1234567).";

const alertMessageAppInfo = "Failed to read application info from device.";

const TouchContainer = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState<any>([]);

  const initialize = async () => {
    const external = props.service.pinormos
      .getOSInfo()
      .current.version.endsWith("E");
    try {
      if (external) {
        await props.service.packrat.cache.addPublicConfig();
      } else {
        await props.service.packrat.cache.addPrivateConfig();
      }
    } catch (error) {
      console.error(error);
      if (external) {
        alertMessage = alertMessagePublicConfigJSON;
      } else {
        alertMessage = alertMessagePrivateConfigJSON;
      }
      setAlert(true);
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
      alertMessage = alertMessageAppInfo;
      setAlert(true);
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

export class TouchWidget extends ReactWidget {
  id: string;
  service: WebDSService;

  constructor(id: string, service: WebDSService) {
    super();
    this.id = id;
    this.service = service;
  }

  render(): JSX.Element {
    return (
      <div id={this.id + "_container"} className="jp-webds-widget-container">
        <div id={this.id + "_content"} className="jp-webds-widget">
          <TouchContainer service={this.service} />
        </div>
        <div className="jp-webds-widget-shadow jp-webds-widget-shadow-top"></div>
        <div className="jp-webds-widget-shadow jp-webds-widget-shadow-bottom"></div>
      </div>
    );
  }
}
