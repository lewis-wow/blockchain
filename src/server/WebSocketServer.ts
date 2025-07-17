import { WebSocketServer as Wss } from 'ws';
import { Contact, Server } from './Server.js';
import { Utils } from '../Utils.js';

const SERVICE_NAME = 'web-socket-server';
const log = Utils.defaultLog.child({ serviceName: SERVICE_NAME });

export class WebSocketServer extends Server {
  private wss: Wss;
  private sockets: WebSocket[] = [];

  constructor(selfContact: Contact) {
    super(selfContact);

    this.wss = new Wss({
      port: this.selfContact.port,
      host: this.selfContact.host,
    });
  }

  override getAddress(): string {
    return `ws:${super.getAddress()}`;
  }

  override listen(): void {
    this.wss.on('listening', () => {
      log.info(`Server running on ${this.getAddress()}`);
      super.listen();
    });

    this.wss.on('connection', (socket) => {
      this.emit('connection', socket);
    });
  }

  protected connectSocket(socket: WebSocket): void {
    this.sockets.push(socket);
    this._handleMessage(socket);
  }

  public broadcastMessage(
    broadcastMessageHandler: (socket: WebSocket) => void,
  ): void {
    for (const socket of this.sockets) {
      broadcastMessageHandler(socket);
    }
  }

  public sendMessage(peer: string | WebSocket, data: string): void {
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
