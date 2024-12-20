import WebSocket from 'ws';
import crypto from 'crypto';
import { Discord, Log } from '../module';
import chalk from 'chalk';
import { Controller } from '../structure';

export const wss = new WebSocket.Server({
  port: parseInt(process.env.SERVER_PORT || '8080'),
});

export const list = new Map<string, WebSocket>();

export const webSocketInit = async () => {
  await Controller.init();
  await Controller.logControllers();

  wss.on('connection', async (ws) => {
    const client_ids = process.env.ALLOW_CLIENT_IDS
      ? process.env.ALLOW_CLIENT_IDS.split(',')
      : await Discord.getClientIds();
    let client_id: string = crypto.randomUUID();
    Log.debug(`New Client ${chalk.green(client_id)} Connected`);

    const timeout = setTimeout(() => {
      Log.debug(`Client ${chalk.green(client_id)} Disconnected (Timeout)`);
      ws.send(
        JSON.stringify({ type: 'login', status: 'fail', reason: 'timeout' }),
      );
      ws.close();
    }, 5000);

    ws.on('message', async (message) => {
      const data = JSON.parse(message.toString());
      if (!data.type) return;
      if (data.type != 'login')
        return Controller.list.get(data.type)?.controller.run(data, ws);
      clearTimeout(timeout);
      if (!data.id || !data.cluster || !client_ids.includes(data.id)) {
        Log.debug(`Client ${chalk.green(client_id)} Disconnected (Invalid ID)`);
        ws.send(
          JSON.stringify({
            type: 'login',
            status: 'fail',
            reason: 'invalid_id',
          }),
        );
        ws.close();
      } else {
        client_id = `${data.id}_${data.cluster}`;
        Log.debug(`Client ${chalk.green(client_id)} Logged In`);
        ws.send(JSON.stringify({ type: 'login', status: 'success' }));
        list.set(client_id, ws);
      }
    });

    ws.on('close', () => {
      Log.debug(`Client ${chalk.green(client_id)} Disconnected`);
      list.delete(client_id);
    });
  });

  wss.on('close', () => {
    Log.debug('WebSocket Server Closed');
  });

  wss.on('error', (error) => {
    Log.error(error);
  });

  Log.info(
    `WebSocket Server Started at ${chalk.yellow(process.env.SERVER_PORT || 8080)}`,
  );
};
