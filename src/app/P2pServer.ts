import { BlockChain } from '../blockchain/BlockChain.js';
import { WebSocketServer, WebSocket } from 'ws';
import { log as defaultLog } from '../utils/logger.js';
import { TransactionPool } from '../cryptocurrency/TransactionPool.js';
import { Transaction } from '../cryptocurrency/Transaction.js';
import { ChainMessage } from '../messages/ChainMessage.js';
import { TransactionMessage } from '../messages/TransactionMessage.js';
import { match } from 'ts-pattern';
import { InvalidMessageType } from '../exceptions/InvalidMessageType.js';
import { ClearTransactionsMessage } from '../messages/ClearTransactionsMessage.js';
import { WebSocketHandler } from '../utils/WebSocketHandler.js';
import { Contract } from '../contracts/Contract.js';
import { syncChainsContract } from '../contracts/syncChainsContract.js';
import { transactionContract } from '../contracts/transactionContract.js';
import { clearTransactionsContract } from '../contracts/clearTransactionsContract.js';

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

  public override attachServer(server: WebSocketServer): WebSocketServer {
    super.attachServer(server);
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

  protected override messageHandler(
    payload: typeof Contract.$BASE_ENVELOP,
  ): void {
    match(payload)
      .when(syncChainsContract.is, ({ data }) => {
        this.handleChain(BlockChain.fromJSON(data));
      })
      .when(transactionContract.is, ({ data }) => {
        this.handleTransaction(TransactionMessage.fromJSON(data));
      })
      .when(clearTransactionsContract.is, () => {
        this.handleClearTransactions();
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

  private handleClearTransactions(): void {
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
