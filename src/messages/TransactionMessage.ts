import { Transaction } from '../cryptocurrency/Transaction.js';
import { JSONObject } from '../types.js';
import { Message } from './Message.js';

export class TransactionMessage extends Message {
  static fromJSON(data: JSONObject): Transaction {
    return Transaction.fromJSON(data);
  }

  static toJSON(transaction: Transaction): JSONObject {
    return transaction.toJSON();
  }

  static readonly MESSAGE_TYPE = 'TRANSACTION';
}
