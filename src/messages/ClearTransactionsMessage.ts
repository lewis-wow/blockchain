import { JSONPrimitive } from '../types.js';
import { Message } from './Message.js';

export class ClearTransactionsMessage extends Message {
  static override fromJSON(): undefined {
    return undefined;
  }

  static override toJSON(): JSONPrimitive {
    return undefined;
  }

  static readonly MESSAGE_TYPE = 'CLEAR_TRANSACTIONS';
}
