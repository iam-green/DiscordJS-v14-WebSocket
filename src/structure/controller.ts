import { glob } from 'glob';
import { Log } from '../module';
import chalk from 'chalk';
import WebSocket from 'ws';

export type ControllerType<T> = {
  type: string;
  run: (message: T, ws: WebSocket) => void;
};

export class Controller<T> {
  constructor(options: ControllerType<T>) {
    Object.assign(this, options);
  }

  public static list = new Map<
    string,
    { path: string; controller: ControllerType<any> }
  >();

  static async init() {
    if (this.list.size < 1) {
      const controllers = glob.sync(
        `${__dirname.replace(/\\/g, '/')}/../controller/**/*.ts`,
      );
      for (const path of controllers) {
        if ((await import(path))?.default instanceof Controller) {
          const controller = (await import(path))?.default;
          this.list.set(controller.type, { path, controller });
        }
      }
    }
  }

  static async logControllers() {
    for (const [type, { path }] of this.list)
      Log.debug(
        `Added ${chalk.green(type)} Controller (Location : ${chalk.yellow(path)})`,
      );
  }
}
