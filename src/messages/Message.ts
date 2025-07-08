import { RawData } from 'ws';
import { JSONData, Nullable } from '../types.js';

export type MessagePayload = {
  messageType: string;
  data: JSONData;
};

export class Message {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static fromJSON(_data: JSONData): unknown {
    return undefined;
  }

  static parse(data: string | RawData): Nullable<MessagePayload> {
    return JSON.parse(data.toString());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static toJSON(_data: unknown): JSONData {
    return undefined;
  }

  static stringify(data: unknown): string {
    return JSON.stringify({
      messageType: this.MESSAGE_TYPE,
      data: this.toJSON(data),
    } satisfies MessagePayload);
  }

  static readonly MESSAGE_TYPE: string = '';
}
