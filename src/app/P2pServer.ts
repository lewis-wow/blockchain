import { BlockChain } from '../blockchain/BlockChain.js';
import { WebSocket } from 'ws';
import { log as defaultLog } from '../utils/logger.js';
import { TransactionPool } from '../cryptocurrency/TransactionPool.js';
import { Transaction } from '../cryptocurrency/Transaction.js';
import { match } from 'ts-pattern';
import { InvalidMessageType } from '../exceptions/InvalidMessageType.js';
import { p2pSyncChainsContract } from '../contracts/p2pSyncChainsContract.js';
import { p2pTransactionContract } from '../contracts/p2ptransactionContract.js';
import { p2pClearTransactionsContract } from '../contracts/p2pClearTransactionsContract.js';
import { HandleMessageArgs, WebSocketServer } from './WebSocketServer.js';

const SERVICE_NAME = 'peer-to-peer-server';
const log = defaultLog.child({ serviceName: SERVICE_NAME });

export type P2pServerOptions = {
  blockChain: BlockChain;
  transactionPool: TransactionPool;
  peers: string[];
  port: number;
};

export class P2pServer extends WebSocketServer {
  private blockChain: BlockChain;
  private transactionPool: TransactionPool;
  private peers: string[];

  constructor(opts: P2pServerOptions) {
    super(opts);

    this.blockChain = opts.blockChain;
    this.transactionPool = opts.transactionPool;
    this.peers = opts.peers;
  }

  override listen(): void {
    super.listen();
    this.connectToPeers();
  }

  private connectToPeers(): void {
    for (const peerAddress of this.peers) {
      this.connectToPeer(peerAddress);
    }
  }

  override connectSocket(socket: WebSocket): void {
    super.connectSocket(socket);
    this.sendChain(socket);
  }

  override handleMessage({ payload }: HandleMessageArgs): void {
    match(payload)
      .when(p2pSyncChainsContract.is, ({ data }) => {
        this.handleChain(p2pSyncChainsContract.parse(data));
      })
      .when(p2pTransactionContract.is, ({ data }) => {
        this.handleTransaction(p2pTransactionContract.parse(data));
      })
      .when(p2pClearTransactionsContract.is, () => {
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
    log.debug('sendChain()');
    this.sendMessage(socket, p2pSyncChainsContract.stringify(this.blockChain));
  }

  public syncChains(): void {
    log.debug('syncChains()');
    this.broadcastMessage(this.sendChain);
  }

  private handleTransaction(transaction: Transaction): void {
    log.debug('handleTransaction()', transaction);
    this.transactionPool.updateOrAddTransaction(transaction);
  }

  private sendTransaction(socket: WebSocket, transaction: Transaction): void {
    log.debug('sendTransaction()', transaction);
    this.sendMessage(socket, p2pTransactionContract.stringify(transaction));
  }

  public broadcastTransactions(transaction: Transaction): void {
    log.debug('broadcastTransactions()', transaction);
    this.broadcastMessage((socket) =>
      this.sendTransaction(socket, transaction),
    );
  }

  private handleClearTransactions(): void {
    log.debug('handleClearTransactions()');
    this.transactionPool.clear();
  }

  private sendClearTransactions(socket: WebSocket): void {
    log.debug('sendClearTransactions()');
    this.sendMessage(socket, p2pClearTransactionsContract.stringify());
  }

  public broadcastClearTransactions(): void {
    log.debug('broadcastClearTransactions()');
    this.broadcastMessage(this.sendClearTransactions);
  }
}
