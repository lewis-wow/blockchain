import { RawData } from 'ws';
import { JSONData } from '../types.js';
import { MethodNotImplemented } from '../exceptions/MethodNotImplemented.js';

export type MessagePayload = {
  messageType?: string | null;
  data: JSONData;
};

export class Message {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static fromJSON(_data: JSONData): unknown {
    throw new MethodNotImplemented();
  }

  static parse(data: string | RawData): MessagePayload {
    return JSON.parse(data.toString());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static toJSON(_data: unknown): JSONData {
    throw new MethodNotImplemented();
  }

  static stringify(data: unknown): string {
    return JSON.stringify({
      messageType: this.MESSAGE_TYPE,
      data: this.toJSON(data),
    } satisfies MessagePayload);
  }

  static readonly MESSAGE_TYPE: string = '';
}
