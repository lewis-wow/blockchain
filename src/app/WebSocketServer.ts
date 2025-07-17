import { WebSocketServer as Wss, WebSocket } from 'ws';
import { log as defaultLog } from '../utils/logger.js';
import { HOSTNAME } from '../consts.js';
import { match } from 'ts-pattern';
import { Contract } from '../contracts/Contract.js';
import { pingContract } from '../contracts/pingContract.js';
import { pongContract } from '../contracts/pongContract.js';
import { Server } from '../server/Server.js';

const SERVICE_NAME = 'web-socket-server';
const log = defaultLog.child({ serviceName: SERVICE_NAME });

export type WebSocketServerOptions = {
  port: number;
};

export type HandleMessageArgs = {
  payload: typeof Contract.$BASE_ENVELOP;
  socket: WebSocket;
};

export abstract class WebSocketServer extends Server {
  protected server: Wss;
  private sockets: WebSocket[] = [];

  constructor(opts: WebSocketServerOptions) {
    super({
      ...opts,
      protocol: 'ws',
    });
  }

  getServer(): Wss {
    return this.server;
  }

  getSockets(): WebSocket[] {
    return this.sockets;
  }

  override listen(handler?: (server: this) => void): void {
    this.server = new Wss({
      port: this.port,
      host: HOSTNAME,
    });

    this.server.on('listening', () => {
      handler?.(this);
    });

    this.server.on('connection', (socket) => {
      this.connectSocket(socket);
    });
  }

  protected connectSocket(socket: WebSocket): void {
    this.sockets.push(socket);
    this._handleMessage(socket);
  }

  protected abstract handleMessage(opts: {
    payload: typeof Contract.$BASE_ENVELOP;
    socket: WebSocket;
  }): void;

  private _handleMessage(socket: WebSocket): void {
    socket.on('message', (message) => {
      console.log(message.toString());
      const parsedMessage = Contract.parse(message);

      if (parsedMessage.success === false) {
        return;
      }

      const payload = parsedMessage.data;

      match(payload)
        .when(
          (shape) => pingContract.is(shape),
          () => this.handlePing(),
        )
        .when(
          (shape) => pongContract.is(shape),
          () => this.handlePong(),
        )
        .otherwise(() =>
          this.handleMessage({
            payload,
            socket,
          }),
        );
    });
  }

  private handlePing(): void {
    log.debug('handlePing()');
  }

  private handlePong(): void {
    log.debug('handlePong()');
  }

  protected broadcastMessage(
    broadcastMessageHandler: (socket: WebSocket) => void,
  ): void {
    for (const socket of this.sockets) {
      broadcastMessageHandler(socket);
    }
  }

  protected connectToPeer(peerAddress: string): WebSocket {
    const socket = new WebSocket(peerAddress);

    socket.on('open', () => {
      this.connectSocket(socket);

      log.info(`Connected to peer: ${peerAddress}`);
    });

    return socket;
  }

  protected sendMessage(peer: string | WebSocket, data: string): void {
    const socket = typeof peer === 'string' ? new WebSocket(peer) : peer;

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(data);
      return;
    }

    socket.on('open', () => {
      socket.send(data);
    });
  }
}
