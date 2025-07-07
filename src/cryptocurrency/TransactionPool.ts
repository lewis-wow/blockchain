import { Transaction } from './Transaction.js';

export class TransactionPool {
  private transactions: Transaction[] = [];

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  getValidTransactions(): Transaction[] {
    return this.transactions.filter((transaction) => {
      const outputTotalAmount = transaction.outputs.reduce(
        (totalAmount, output) => totalAmount + output.amount,
        0,
      );

      if (transaction.input!.amount !== outputTotalAmount) {
        // throw new InvalidTransaction(transaction.input!.address);
        return false;
      }

      if (!Transaction.verifyTransaction(transaction)) {
        // throw new InvalidTransaction(transaction.input!.address);
        return false;
      }

      return true;
    });
  }

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

  findTransactionBySenderAddress(
    senderAddress: string,
  ): Transaction | undefined {
    return this.transactions.find(
      (transaction) => transaction.input!.address === senderAddress,
    );
  }

  clear(): void {
    this.transactions = [];
  }
}
