import { describe, test, expect, beforeEach } from 'vitest';
import { TransactionPool } from '../../../src/cryptocurrency/TransactionPool.js';
import { Transaction } from '../../../src/cryptocurrency/Transaction.js';

describe('TransactionPool', () => {
  let transactionPool: TransactionPool;
  let transactions: [Transaction, Transaction];

  beforeEach(() => {
    transactionPool = new TransactionPool();
    transactions = [new Transaction(), new Transaction()];
    transactionPool.updateOrAddTransaction(transactions[0]);
  });

  describe('updateOrAddTransaction()', () => {
    test('add new transaction', () => {
      expect(transactionPool.transactions.length).toBe(1);

      transactionPool.updateOrAddTransaction(transactions[1]);
      expect(transactionPool.transactions.length).toBe(2);
    });

    test('update existing transaction', () => {
      transactionPool.updateOrAddTransaction(transactions[0]);
      expect(transactionPool.transactions.length).toBe(1);
    });
  });
});
