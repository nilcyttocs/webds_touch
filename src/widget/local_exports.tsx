import React from 'react';

import { TouchcommTouchReport, TouchcommTraceReport } from '@webds/service';

export const TouchDataContext = React.createContext(
  [] as TouchcommTouchReport[]
);

export const TraceDataContext = React.createContext(
  [] as TouchcommTraceReport[]
);

export { requestAPI, webdsService } from '../local_exports';
