import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import { WidgetTracker } from "@jupyterlab/apputils";

import { ILauncher } from "@jupyterlab/launcher";

import { WebDSService, WebDSWidget } from "@webds/service";

import { touchIcon } from "./icons";

import TouchWidget from "./widget/TouchWidget";

namespace Attributes {
  export const command = "webds_touch:open";
  export const id = "webds_touch_widget";
  export const label = "Touch Data";
  export const caption = "Touch Data";
  export const category = "Touch - Assessment";
  export const rank = 20;
}

export let webdsService: WebDSService;

/**
 * Initialization data for the @webds/touch extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: "@webds/touch:plugin",
  autoStart: true,
  requires: [ILauncher, ILayoutRestorer, WebDSService],
  activate: (
    app: JupyterFrontEnd,
    launcher: ILauncher,
    restorer: ILayoutRestorer,
    service: WebDSService
  ) => {
    console.log("JupyterLab extension @webds/touch is activated!");

    webdsService = service;

    let widget: WebDSWidget;
    const { commands, shell } = app;
    const command = Attributes.command;
    commands.addCommand(command, {
      label: Attributes.label,
      caption: Attributes.caption,
      icon: (args: { [x: string]: any }) => {
        return args["isLauncher"] ? touchIcon : undefined;
      },
      execute: () => {
        if (!widget || widget.isDisposed) {
          const content = new TouchWidget(Attributes.id);
          widget = new WebDSWidget<TouchWidget>({ content });
          widget.id = Attributes.id;
          widget.title.label = Attributes.label;
          widget.title.icon = touchIcon;
          widget.title.closable = true;
        }

        if (!tracker.has(widget)) tracker.add(widget);

        if (!widget.isAttached) shell.add(widget, "main");

        shell.activateById(widget.id);
      }
    });

    launcher.add({
      command,
      args: { isLauncher: true },
      category: Attributes.category,
      rank: Attributes.rank
    });

    let tracker = new WidgetTracker<WebDSWidget>({
      namespace: Attributes.id
    });
    restorer.restore(tracker, { command, name: () => Attributes.id });
  }
};

export default plugin;
