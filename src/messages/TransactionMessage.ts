import { Transaction } from '../cryptocurrency/Transaction.js';
import { Message } from './Message.js';

export class TransactionMessage extends Message {
  static override create(data: Record<string, unknown>): Transaction {
    return Transaction.fromJSON(data);
  }

  static override serialize(transaction: Transaction): string {
    return super.serialize(transaction.toJSON());
  }

  static override readonly MESSAGE_TYPE = 'TRANSACTION';
}
