import { Message } from './Message.js';

export class PongMessage extends Message {
  static readonly MESSAGE_TYPE = 'PONG';
}
