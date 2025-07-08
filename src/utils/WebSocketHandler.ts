import { WebSocketServer, WebSocket } from 'ws';
import { Message, MessagePayload } from '../messages/Message.js';
import { match } from 'ts-pattern';
import { PingMessage } from '../messages/PingMessage.js';
import { PongMessage } from '../messages/PongMessage.js';

export class WebSocketHandler {
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

    this.handleMessage(socket);
  }

  // @ts-expect-error - unused destructured properties
  protected messageHandler({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    messageType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data,
  }: MessagePayload): void {}

  private handleMessage(socket: WebSocket): void {
    socket.on('message', (message) => {
      const { messageType, data } = Message.parse(message);

      match(messageType)
        .with(undefined, null, () => {})
        .with(PingMessage.MESSAGE_TYPE, () => this.handlePing())
        .with(PongMessage.MESSAGE_TYPE, () => this.handlePong())
        .otherwise((messageType) => {
          this.messageHandler({ messageType, data });
        });
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
