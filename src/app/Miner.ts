import { BlockChain } from '../blockchain/BlockChain.js';
import { TransactionPool } from '../cryptocurrency/TransactionPool.js';
import { Wallet } from '../cryptocurrency/Wallet.js';
import { P2pServer } from './P2pServer.js';

export type MinerOptions = {
  blockChain: BlockChain;
  transactionPool: TransactionPool;
  wallet: Wallet;
  p2pServer: P2pServer;
};

export class Miner {
  private blockChain: BlockChain;
  private transactionPool: TransactionPool;
  private wallet: Wallet;
  private p2pServer: P2pServer;

  constructor(opts: MinerOptions) {
    this.blockChain = opts.blockChain;
    this.transactionPool = opts.transactionPool;
    this.wallet = opts.wallet;
    this.p2pServer = opts.p2pServer;
  }

  /**
   * Includes a reward for a miner
   * Creates a block consisting of the valid transactions
   * Sync the chains in peer-to-peer server
   * Clear the transaction pool
   * Broadcast to every miner the transaction pool clear
   */
  mine() {}
}
