import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { WebDSService } from '@webds/service';

import { touchIcon } from './icons';

import { TouchWidget } from './widget_container';

/**
 * Initialization data for the @webds/touch extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@webds/touch:plugin',
  autoStart: true,
  requires: [ILauncher, ILayoutRestorer, WebDSService],
  activate: (app: JupyterFrontEnd, launcher: ILauncher, restorer: ILayoutRestorer, service: WebDSService) => {
    console.log('JupyterLab extension @webds/touch is activated!');

    let widget: MainAreaWidget;
    const {commands, shell} = app;
    const command: string = 'webds_touch:open';
    commands.addCommand(command, {
      label: 'Touch Data',
      caption: 'Touch Data',
      icon: (args: {[x: string]: any}) => {
        return args['isLauncher'] ? touchIcon : undefined;
      },
      execute: () => {
        if (!widget || widget.isDisposed) {
          const content = new TouchWidget(service);
          widget = new MainAreaWidget<TouchWidget>({content});
          widget.id = 'webds_touch_widget';
          widget.title.label = 'Touch Data';
          widget.title.icon = touchIcon;
          widget.title.closable = true;
        }

        if (!tracker.has(widget))
          tracker.add(widget);

        if (!widget.isAttached)
          shell.add(widget, 'main');

        shell.activateById(widget.id);
      }
    });

    launcher.add({command, args: {isLauncher: true}, category: 'WebDS - Exploration'});

    let tracker = new WidgetTracker<MainAreaWidget>({namespace: 'webds_touch'});
    restorer.restore(tracker, {command, name: () => 'webds_touch'});
  }
};

export default plugin;
