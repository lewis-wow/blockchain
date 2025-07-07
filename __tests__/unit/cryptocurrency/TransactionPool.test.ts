import { describe, test, expect, beforeEach } from 'vitest';
import { TransactionPool } from '../../../src/cryptocurrency/TransactionPool.js';
import { Transaction } from '../../../src/cryptocurrency/Transaction.js';
import { Wallet } from '../../../src/cryptocurrency/Wallet.js';

describe('TransactionPool', () => {
  describe('updateOrAddTransaction()', () => {
    let transactionPool: TransactionPool;
    let transactions: [Transaction, Transaction];

    beforeEach(() => {
      transactionPool = new TransactionPool();
      transactions = [new Transaction(), new Transaction()];
      transactionPool.updateOrAddTransaction(transactions[0]);
    });

    test('add new transaction', () => {
      expect(transactionPool.getTransactions().length).toBe(1);

      transactionPool.updateOrAddTransaction(transactions[1]);
      expect(transactionPool.getTransactions().length).toBe(2);
    });

    test('update existing transaction', () => {
      transactionPool.updateOrAddTransaction(transactions[0]);
      expect(transactionPool.getTransactions().length).toBe(1);
    });
  });

  describe('getValidTransactions()', () => {
    let transactionPool: TransactionPool,
      wallet: Wallet,
      amount: number,
      recipientAddress: string,
      transaction: Transaction,
      validTransactions: Transaction[];

    beforeEach(() => {
      transactionPool = new TransactionPool();
      wallet = new Wallet();
      amount = 100;
      recipientAddress = 'recipientAddress';
      validTransactions = [];

      for (let i = 0; i < 5; i++) {
        wallet = new Wallet();
        transaction = wallet.createTransaction({
          amount,
          recipientAddress,
          transactionPool,
        });

        if (i % 2) {
          validTransactions.push(transaction);
        } else {
          transaction.input!.amount = 99999;
        }
      }
    });

    test('some transactions are invalid', () => {
      expect(transactionPool.getTransactions()).not.toEqual(validTransactions);
    });

    test('remove invalid transactions', () => {
      expect(transactionPool.getValidTransactions()).toEqual(validTransactions);
    });
  });
});
