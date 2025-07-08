import { WebSocketServer, WebSocket, RawData } from 'ws';

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected messageHandler(_message: RawData): void {}

  private handleMessage(socket: WebSocket): void {
    socket.on('message', (message) => this.messageHandler(message));
  }

  protected broadcastMessage(
    broadcastMessageHandler: (socket: WebSocket) => void,
  ): void {
    for (const socket of this.sockets) {
      broadcastMessageHandler(socket);
    }
  }
}
