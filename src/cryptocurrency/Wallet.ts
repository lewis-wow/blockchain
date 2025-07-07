import { renderString } from 'prettyjson';
import { KeyPair } from './KeyPair.js';
import { TransactionPool } from './TransactionPool.js';
import { AmountExceedsBalance } from '../exceptions/AmountExceedsBalance.js';
import { Transaction } from './Transaction.js';

export type CreateTransactionArgs = {
  amount: number;
  recipientAddress: string;
  transactionPool: TransactionPool;
};

export class Wallet {
  balance: number;
  keyPair: KeyPair;
  publicKey: string;

  constructor() {
    this.balance = Wallet.INITIAL_BALANCE;
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
  }: CreateTransactionArgs): Transaction {
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

  static readonly INITIAL_BALANCE = 500;

  static createBlockchainWallet(): Wallet {
    const wallet = new Wallet();
    return wallet;
  }
}
