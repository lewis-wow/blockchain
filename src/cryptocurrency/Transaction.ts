import { v4 as uuid } from 'uuid';
import { Wallet } from './Wallet.js';
import { sha256 } from '../utils/sha256.js';
import { KeyPair } from './KeyPair.js';
import { AmountExceedsBalance } from '../exceptions/AmountExceedsBalance.js';
import { Serializable } from '../Serializable.js';
import { JSONObject } from '../types.js';
import { MINER_MINING_REWARD } from '../consts.js';

export type TransactionInput = {
  timestamp: Date;
  amount: number;
  address: string;
  signature?: string;
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
  recipientAddress: string;
  amount: number;
};

export class Transaction extends Serializable {
  id = uuid();
  input: TransactionInput | null = null;
  outputs: TransactionOutput[] = [];

  update({
    senderWallet,
    recipientAddress,
    amount,
  }: CreateTransactionArgs): Transaction {
    /**
     * The sender output in output array that already has `senderWallet.balance - amount`
     */
    const senderResultOutput = this.outputs.find(
      (output) => output.address === senderWallet.publicKey,
    )!;

    if (amount > senderResultOutput.amount) {
      throw new AmountExceedsBalance(amount);
    }

    senderResultOutput.amount -= amount;

    this.outputs.push({ address: recipientAddress, amount });

    Transaction.signTransaction(this, senderWallet);

    return this;
  }

  override toJSON(): JSONObject {
    return {
      id: this.id,
      input: this.input,
      outputs: this.outputs,
    };
  }

  static override fromJSON(json: JSONObject): Transaction {
    const transaction = new Transaction();
    transaction.id = json.id as string;
    transaction.input = json.input as TransactionInput;
    transaction.outputs = json.outputs as TransactionOutput[];

    return transaction;
  }

  static _transactionWithOutputs(
    senderWallet: Wallet,
    outputs: TransactionOutput[],
  ): Transaction {
    const transaction = new Transaction();
    transaction.outputs.push(...outputs);
    Transaction.signTransaction(transaction, senderWallet);
    return transaction;
  }

  static createTransaction({
    senderWallet,
    recipientAddress,
    amount,
  }: CreateTransactionArgs): Transaction {
    if (amount > senderWallet.balance) {
      throw new AmountExceedsBalance(amount);
    }

    return Transaction._transactionWithOutputs(senderWallet, [
      {
        amount: senderWallet.balance - amount,
        address: senderWallet.publicKey,
      },
      {
        amount,
        address: recipientAddress,
      },
    ]);
  }

  static createRewardTransaction(
    minerWallet: Wallet,
    blockChainWallet: Wallet,
  ): Transaction {
    return Transaction._transactionWithOutputs(blockChainWallet, [
      {
        amount: MINER_MINING_REWARD,
        address: minerWallet.publicKey,
      },
    ]);
  }

  static signTransaction(transaction: Transaction, senderWallet: Wallet): void {
    transaction.input = {
      timestamp: new Date(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(sha256(JSON.stringify(transaction.outputs))),
    };
  }

  static verifyTransaction(transaction: Transaction): boolean {
    const { input } = transaction;

    return KeyPair.verifySignature({
      publicKey: input!.address,
      signature: input!.signature!,
      data: sha256(JSON.stringify(transaction.outputs)),
    });
  }
}
