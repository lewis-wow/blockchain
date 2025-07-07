import { Transaction } from '../cryptocurrency/Transaction.js';
import { Message } from './Message.js';

export class TransactionMessage extends Message {
  static create(data: Record<string, unknown>): Transaction {
    return Transaction.fromJSON(data);
  }

  static serialize(transaction: Transaction): string {
    return super.stringify(
      TransactionMessage.MESSAGE_TYPE,
      transaction.toJSON(),
    );
  }

  static readonly MESSAGE_TYPE = 'TRANSACTION';
}
