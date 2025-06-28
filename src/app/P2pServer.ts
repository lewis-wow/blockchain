import { BlockChain } from '../blockchain/BlockChain.js';
import { WebSocketServer, WebSocket } from 'ws';
import { log as defaultLog } from '../utils/logger.js';
import { ServerAddressInfo } from '../utils/ServerAddressInfo.js';

const SERVICE_NAME = 'peer-to-peer-server';
const log = defaultLog.child({ serviceName: SERVICE_NAME });

export type P2pServerOptions = {
  blockChain: BlockChain;
  peers: string[];
};

export type ListenArgs = {
  port?: number;
};

export class P2pServer {
  private sockets: WebSocket[] = [];
  private blockChain: BlockChain;
  private peers: string[];

  constructor(opts: P2pServerOptions) {
    this.blockChain = opts.blockChain;
    this.peers = opts.peers;
  }

  listen({ port }: ListenArgs): WebSocketServer {
    const server = new WebSocketServer({
      port,
    });

    server.on('listening', () => {
      const serverAddressInfo = ServerAddressInfo.parse(server.address(), 'ws');

      log.info(`Server running on ${serverAddressInfo.toString()}`);
    });

    server.on('connection', (socket) => {
      this.connectSocket(socket);

      log.info(`Peer connected.`);
    });

    this.connectToPeers();

    return server;
  }

  private connectToPeers(): void {
    for (const peer of this.peers) {
      const socket = new WebSocket(peer);

      socket.on('open', () => {
        this.connectSocket(socket);

        log.info(`Connected to peer ${peer}`);
      });
    }
  }

  private connectSocket(socket: WebSocket): void {
    this.sockets.push(socket);
  }
}
