import { BlockChain } from '../blockchain/BlockChain.js';
import { WebSocketServer, WebSocket, RawData } from 'ws';
import { log as defaultLog } from '../utils/logger.js';
import { TransactionPool } from '../cryptocurrency/TransactionPool.js';
import { Transaction } from '../cryptocurrency/Transaction.js';
import { ChainMessage } from '../messages/ChainMessage.js';
import { TransactionMessage } from '../messages/TransactionMessage.js';
import { Message } from '../messages/Message.js';
import { match } from 'ts-pattern';
import { InvalidMessageType } from '../exceptions/InvalidMessageType.js';
import { ClearTransactionsMessage } from '../messages/ClearTransactionsMessage.js';
import { JSONObject } from '../types.js';
import { HOSTNAME, P2P_SERVER_PROTOCOL } from '../config.js';
import { WebSocketHandler } from '../utils/WebSocketHandler.js';

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

export class P2pServer extends WebSocketHandler {
  private blockChain: BlockChain;
  private transactionPool: TransactionPool;
  private peers: string[];

  constructor(opts: P2pServerOptions) {
    super();

    this.blockChain = opts.blockChain;
    this.transactionPool = opts.transactionPool;
    this.peers = opts.peers;
  }

  listen({ port }: ListenArgs): WebSocketServer {
    const server = new WebSocketServer({
      port,
      host: HOSTNAME,
    });

    server.on('listening', () => {
      log.info(
        `Peer-to-peer server running on ${P2P_SERVER_PROTOCOL}://${HOSTNAME}:${port}`,
      );
    });

    this.attachServer(server);
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

  protected override connectSocket(socket: WebSocket): void {
    super.connectSocket(socket);
    this.sendChain(socket);
  }

  protected override messageHandler(message: RawData): void {
    const { messageType, data } = Message.parse(message);

    match(messageType)
      .with(undefined, null, () => {})
      .with(ChainMessage.MESSAGE_TYPE, () => {
        this.handleChain(ChainMessage.fromJSON(data as JSONObject[]));
      })
      .with(TransactionMessage.MESSAGE_TYPE, () => {
        this.handleTransaction(TransactionMessage.fromJSON(data as JSONObject));
      })
      .with(ClearTransactionsMessage.MESSAGE_TYPE, () => {
        this.handleClearTransactions(ClearTransactionsMessage.fromJSON());
      })
      .otherwise(() => {
        throw new InvalidMessageType();
      });
  }

  private handleChain(blockChain: BlockChain): void {
    log.debug('handleChain()', blockChain);

    this.blockChain.replaceChain(blockChain.getChain());
  }

  private sendChain(socket: WebSocket): void {
    socket.send(ChainMessage.stringify(this.blockChain));
  }

  public syncChains(): void {
    this.broadcastMessage(this.sendChain);
  }

  private handleTransaction(transaction: Transaction): void {
    log.debug('handleTransaction()', transaction);

    this.transactionPool.updateOrAddTransaction(transaction);
  }

  private sendTransaction(socket: WebSocket, transaction: Transaction): void {
    socket.send(TransactionMessage.stringify(transaction));
  }

  public broadcastTransactions(transaction: Transaction): void {
    this.broadcastMessage((socket) =>
      this.sendTransaction(socket, transaction),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleClearTransactions(_?: undefined): void {
    log.debug('handleClearTransactions()');

    this.transactionPool.clear();
  }

  private sendClearTransactions(socket: WebSocket): void {
    socket.send(ClearTransactionsMessage.stringify(null));
  }

  public broadcastClearTransactions(): void {
    this.broadcastMessage(this.sendClearTransactions);
  }
}
