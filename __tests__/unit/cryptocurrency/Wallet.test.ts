import { describe, test, expect, beforeEach } from 'vitest';
import { Wallet } from '../../../src/cryptocurrency/Wallet.js';
import { TransactionPool } from '../../../src/cryptocurrency/TransactionPool.js';
import { Transaction } from '../../../src/cryptocurrency/Transaction.js';
import { BlockChain } from '../../../src/blockchain/BlockChain.js';
import { WALLET_INITIAL_BALANCE } from '../../../src/config.js';

describe('Wallet', () => {
  let wallet: Wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  test('`balance` match `Wallet.INITIAL_BALANCE`', () => {
    expect(wallet.balance).toEqual(WALLET_INITIAL_BALANCE);
  });

  describe('createTransaction()', () => {
    let amount: number,
      transaction: Transaction,
      transactionPool: TransactionPool,
      recipientAddress: string,
      blockChain: BlockChain;

    beforeEach(() => {
      blockChain = new BlockChain();
      amount = 100;
      recipientAddress = 'recipientAddress';
      transactionPool = new TransactionPool();
      transaction = wallet.createTransaction({
        amount,
        recipientAddress,
        transactionPool,
        blockChain,
      });
    });

    test('creates a transaction and adds it to transaction pool', () => {
      // @ts-expect-error - private property
      expect(transactionPool.transactions.length).toBe(1);
      expect(
        transaction.outputs.find(
          (output) => output.address === wallet.publicKey,
        )!.amount,
      ).toEqual(wallet.balance - amount);
    });

    test('update a transaction by calling `createTransaction` twice', () => {
      wallet.createTransaction({
        amount,
        recipientAddress,
        transactionPool,
        blockChain,
      });

      // @ts-expect-error - private property
      expect(transactionPool.transactions.length).toBe(1);

      expect(
        transaction.outputs.find(
          (output) => output.address === wallet.publicKey,
        )!.amount,
      ).toEqual(wallet.balance - 2 * amount);

      expect(
        transaction.outputs
          .filter((output) => output.address === recipientAddress)
          .map((transactionOutput) => transactionOutput.amount),
      ).toEqual([amount, amount]);
    });

    test('amount is more than balance', () => {
      expect(() =>
        wallet.createTransaction({
          amount: wallet.balance + 1,
          recipientAddress: 'recipientAddress',
          transactionPool,
          blockChain,
        }),
      ).toThrowError();
    });
  });
});
