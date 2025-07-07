import { BlockChain } from '../blockchain/BlockChain.js';
import { WebSocketServer, WebSocket } from 'ws';
import { log as defaultLog } from '../utils/logger.js';
import { ServerAddressInfo } from '../utils/ServerAddressInfo.js';
import { TransactionPool } from '../cryptocurrency/TransactionPool.js';
import { Transaction } from '../cryptocurrency/Transaction.js';
import { ChainMessage } from '../messages/ChainMessage.js';
import { TransactionMessage } from '../messages/TransactionMessage.js';
import { Message } from '../messages/Message.js';
import { match } from 'ts-pattern';
import { InvalidMessageType } from '../exceptions/InvalidMessageType.js';
import { ClearTransactionsMessage } from '../messages/ClearTransactionsMessage.js';
import { JSONObject } from '../types.js';

const SERVICE_NAME = 'peer-to-peer-server';
const log = defaultLog.child({ serviceName: SERVICE_NAME });

export type P2pServerOptions = {
  blockChain: BlockChain;
  transactionPool: TransactionPool;
  peers: string[];
};

export type ListenArgs = {
  port?: number;
};

export class P2pServer {
  private sockets: WebSocket[] = [];
  private blockChain: BlockChain;
  private transactionPool: TransactionPool;
  private peers: string[];

  constructor(opts: P2pServerOptions) {
    this.blockChain = opts.blockChain;
    this.transactionPool = opts.transactionPool;
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

    this.messageHandler(socket);

    this.sendChain(socket);
  }

  private messageHandler(socket: WebSocket): void {
    socket.on('message', (message) => {
      const { messageType, data } = Message.parse(message);

      match(messageType)
        .with(undefined, null, () => {})
        .with(ChainMessage.MESSAGE_TYPE, () => {
          this.handleChain(ChainMessage.fromJSON(data as JSONObject[]));
        })
        .with(TransactionMessage.MESSAGE_TYPE, () => {
          this.handleTransaction(
            TransactionMessage.fromJSON(data as JSONObject),
          );
        })
        .with(ClearTransactionsMessage.MESSAGE_TYPE, () => {
          this.handleClearTransactions(ClearTransactionsMessage.fromJSON());
        })
        .otherwise(() => {
          throw new InvalidMessageType();
        });
    });
  }

  private handleChain(blockChain: BlockChain): void {
    log.debug('Another peer blockchain', blockChain);

    this.blockChain.replaceChain(blockChain.getChain());
  }

  private sendChain(socket: WebSocket): void {
    socket.send(ChainMessage.stringify(this.blockChain));
  }

  private handleTransaction(transaction: Transaction): void {
    log.debug('Another peer transaction', transaction);

    this.transactionPool.updateOrAddTransaction(transaction);
  }

  private sendTransaction(socket: WebSocket, transaction: Transaction): void {
    socket.send(TransactionMessage.stringify(transaction));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleClearTransactions(_?: undefined): void {}

  public syncChains(): void {
    for (const socket of this.sockets) {
      this.sendChain(socket);
    }
  }

  public broadcastTransactions(transaction: Transaction): void {
    for (const socket of this.sockets) {
      this.sendTransaction(socket, transaction);
    }
  }
}
