import { Block } from '../blockchain/Block.js';
import { BlockChain } from '../blockchain/BlockChain.js';
import { Transaction } from './Transaction.js';
import { TransactionPool } from './TransactionPool.js';
import { Wallet } from './Wallet.js';
import { P2pServer } from '../app/P2pServer.js';

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
  mine(): Block {
    const validTransactions = this.transactionPool.getValidTransactions();

    // Include a reward for a miner
    const transactions = [
      ...validTransactions,
      Transaction.createRewardTransaction(
        this.wallet,
        Wallet.createBlockchainWallet(),
      ),
    ];

    // Create a block consisting of the valid transactions
    const block = this.blockChain.addBlock({
      transactions: transactions.map((transaction) => transaction.toJSON()),
    });

    // Sync the chains in peer-to-peer server
    this.p2pServer.syncChains();

    // Clear the transaction pool
    this.transactionPool.clear();

    // Broadcast to every miner the transaction pool clear
    this.p2pServer.broadcastClearTransactions();

    return block;
  }
}
