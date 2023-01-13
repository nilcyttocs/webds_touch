import React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';

import TouchComponent from './TouchComponent';

export class TouchWidget extends ReactWidget {
  id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }

  render(): JSX.Element {
    return (
      <div id={this.id + '_component'}>
        <TouchComponent />
      </div>
    );
  }
}

export default TouchWidget;
