import React from "react";

import { TouchcommTouchReport, TouchcommTraceReport } from "@webds/service";

export { requestAPI } from "../handler";

export const TouchDataContext = React.createContext(
  [] as TouchcommTouchReport[]
);

export const TraceDataContext = React.createContext(
  [] as TouchcommTraceReport[]
);
