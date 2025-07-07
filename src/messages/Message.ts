import { RawData } from 'ws';

export class Message {
  static parseMessage(serializedData: string | RawData): {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    messageType?: string | null;
  } {
    return JSON.parse(serializedData.toString());
  }

  static stringify(messageType: string, data: unknown): string {
    return JSON.stringify({
      messageType,
      data,
    });
  }
}
