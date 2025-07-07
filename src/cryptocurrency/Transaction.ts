import { v4 as uuid } from 'uuid';
import { Wallet } from './Wallet.js';
import { sha256 } from '../utils/sha256.js';
import { KeyPair } from './KeyPair.js';

export type TransactionInput = {
  timestamp: Date;
  amount: number;
  address: string;
  signature: string;
};

export type TransactionOutput = {
  amount: number;
  address: string;
};

export type TransactionOptions = {
  input: TransactionInput;
  outputs: TransactionOutput[];
};

export type CreateTransactionArgs = {
  senderWallet: Wallet;
  recepientAddress: string;
  amount: number;
};

export class Transaction {
  id: string;
  input: TransactionInput;
  outputs: TransactionOutput[];

  constructor(opts: TransactionOptions) {
    this.id = uuid();
    this.input = opts.input;
    this.outputs = opts.outputs;
  }

  static createTransaction({
    senderWallet,
    recepientAddress,
    amount,
  }: CreateTransactionArgs): Transaction {
    if (amount > senderWallet.balance) {
      throw new Error(`Amount: ${amount} exceeds balance.`);
    }

    const outputs: TransactionOutput[] = [
      {
        amount: senderWallet.balance - amount,
        address: senderWallet.publicKey,
      },
      {
        amount,
        address: recepientAddress,
      },
    ];

    const input: TransactionInput = {
      timestamp: new Date(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(sha256(JSON.stringify(outputs))),
    };

    return new Transaction({
      input,
      outputs,
    });
  }

  static verifyTransaction(transaction: Transaction): boolean {
    const { input } = transaction;

    return KeyPair.verifySignature({
      publicKey: input.address,
      signature: input.signature,
      data: sha256(JSON.stringify(transaction.outputs)),
    });
  }
}
