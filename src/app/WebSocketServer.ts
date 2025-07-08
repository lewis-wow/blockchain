import { WebSocketServer as Wss } from 'ws';
import { log as defaultLog } from '../utils/logger.js';
import { HOSTNAME } from '../config.js';
import { DhtServer } from './DhtServer.js';
import { P2pServer } from './P2pServer.js';

const SERVICE_NAME = 'web-socket-server';
const log = defaultLog.child({ serviceName: SERVICE_NAME });

export type WebSocketServerOptions = {
  p2pServer: P2pServer;
  dhtServer: DhtServer;
};

export type ListenArgs = {
  port?: number;
};

export class WebSocketServer {
  private p2pServer: P2pServer;
  private dhtServer: DhtServer;

  constructor(opts: WebSocketServerOptions) {
    this.dhtServer = opts.dhtServer;
    this.p2pServer = opts.p2pServer;
  }

  listen({ port }: ListenArgs): Wss {
    const server = new Wss({
      port,
      host: HOSTNAME,
    });

    server.on('listening', () => {
      log.info(`Websocket server running on ws://${HOSTNAME}:${port}`);
    });

    this.p2pServer.attachServer(server);
    this.dhtServer.attachServer(server);

    return server;
  }
}
