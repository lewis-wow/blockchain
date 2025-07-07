import { Transaction } from './Transaction.js';

export class TransactionPool {
  transactions: Transaction[] = [];

  updateOrAddTransaction(transaction: Transaction): void {
    const transactionWithIdIndex = this.transactions.findIndex(
      (t) => t.id === transaction.id,
    );

    if (transactionWithIdIndex >= 0) {
      this.transactions[transactionWithIdIndex] = transaction;

      return;
    }

    this.transactions.push(transaction);
  }
}
