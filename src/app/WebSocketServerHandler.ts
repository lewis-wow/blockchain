import { WebSocketServer, WebSocket } from 'ws';
import { match } from 'ts-pattern';
import { Contract } from '../contracts/Contract.js';
import { pingContract } from '../contracts/pingContract.js';
import { pongContract } from '../contracts/pongContract.js';

export abstract class WebSocketServerHandler {
  private server?: WebSocketServer;
  protected sockets: WebSocket[] = [];

  public attachServer(server: WebSocketServer): void {
    this.server = server;

    this.server.on('connection', (socket) => {
      this.connectSocket(socket);
    });
  }

  protected connectSocket(socket: WebSocket): void {
    this.sockets.push(socket);
    this._handleMessage(socket);
  }

  protected abstract handleMessage(
    payload: typeof Contract.$BASE_ENVELOP,
  ): void;

  private _handleMessage(socket: WebSocket): void {
    socket.on('message', (message) => {
      const payload = Contract.parse(message);

      if (payload.success === false) {
        return;
      }

      match(payload.data)
        .when(pingContract.is, () => this.handlePing())
        .when(pongContract.is, () => this.handlePong())
        .otherwise(this.handleMessage);
    });
  }

  private handlePing(): void {}

  private handlePong(): void {}

  protected broadcastMessage(
    broadcastMessageHandler: (socket: WebSocket) => void,
  ): void {
    for (const socket of this.sockets) {
      broadcastMessageHandler(socket);
    }
  }
}
