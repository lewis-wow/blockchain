import { renderString } from 'prettyjson';
import { KeyPair } from './KeyPair.js';
import { TransactionPool } from './TransactionPool.js';
import { AmountExceedsBalance } from '../exceptions/AmountExceedsBalance.js';
import { Transaction } from './Transaction.js';
import { BlockChain } from '../blockchain/BlockChain.js';
import { JSONArray, JSONObject } from '../types.js';
import { WALLET_INITIAL_BALANCE } from '../config.js';

export type CreateTransactionArgs = {
  amount: number;
  recipientAddress: string;
  transactionPool: TransactionPool;
  blockChain: BlockChain;
};

export class Wallet {
  balance: number;
  keyPair: KeyPair;
  publicKey: string;

  constructor() {
    this.balance = WALLET_INITIAL_BALANCE;
    this.keyPair = KeyPair.generateKeyPair();
    this.publicKey = this.keyPair.getPublicKey();
  }

  sign(dataHash: string): string {
    return this.keyPair.sign(dataHash);
  }

  createTransaction({
    amount,
    recipientAddress,
    transactionPool,
    blockChain,
  }: CreateTransactionArgs): Transaction {
    this.balance = this.calculateBalance(blockChain);

    if (amount > this.balance) {
      throw new AmountExceedsBalance(amount);
    }

    let transaction = transactionPool.findTransactionBySenderAddress(
      this.publicKey,
    );

    if (transaction) {
      transaction.update({
        senderWallet: this,
        amount,
        recipientAddress,
      });
    } else {
      transaction = Transaction.createTransaction({
        senderWallet: this,
        amount,
        recipientAddress,
      });

      transactionPool.updateOrAddTransaction(transaction);
    }

    return transaction;
  }

  toJSON(): Record<string, unknown> {
    return {
      balance: this.balance,
      publicKey: this.publicKey,
    };
  }

  toString(): string {
    return renderString(
      JSON.stringify({
        Block: this.toJSON(),
      }),
    );
  }

  calculateBalance(blockChain: BlockChain): number {
    let balance = this.balance;
    const transactions: Transaction[] = [];

    for (const block of blockChain.getChain()) {
      const dataTransactions = (
        (block.data as JSONObject).transactions as JSONArray
      ).map((transaction) => Transaction.fromJSON(transaction as JSONObject));

      for (const transaction of dataTransactions) {
        transactions.push(transaction);
      }
    }

    const walletInputTransactions = transactions.filter(
      (transaction) => transaction.input!.address === this.publicKey,
    );

    let startTime = 0;

    if (walletInputTransactions.length > 0) {
      const mostRecentWalletInputTransaction = walletInputTransactions.reduce(
        (prev, current) =>
          prev.input!.timestamp.getTime() > current.input!.timestamp.getTime()
            ? prev
            : current,
      );

      balance = mostRecentWalletInputTransaction.outputs.find(
        (output) => output.address === this.publicKey,
      )!.amount;
      startTime = mostRecentWalletInputTransaction.input!.timestamp.getTime();
    }

    for (const transaction of transactions) {
      if (transaction.input!.timestamp.getTime() > startTime) {
        balance +=
          transaction.outputs.find(
            (output) => output.address === this.publicKey,
          )?.amount ?? 0;
      }
    }

    return balance;
  }

  static createBlockchainWallet(): Wallet {
    const wallet = new Wallet();
    return wallet;
  }
}
