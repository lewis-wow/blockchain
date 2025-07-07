import { RawData } from 'ws';
import { SerializableData } from '../utils/Serializable.js';

export class Message {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  static create(_data: SerializableData): any {
    throw new Error('create() must be implemented in subclass.');
  }

  static parseMessage(serializedData: string | RawData): {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    messageType: typeof Message.MESSAGE_TYPE;
  } {
    return JSON.parse(serializedData.toString());
  }

  static serialize(data: unknown): string {
    return JSON.stringify({
      messageType: (this.constructor as typeof Message).MESSAGE_TYPE,
      data,
    });
  }

  static readonly MESSAGE_TYPE: string | null = null;
}
