import { Message } from './Message.js';

export class PingMessage extends Message {
  static readonly MESSAGE_TYPE = 'PING';
}
