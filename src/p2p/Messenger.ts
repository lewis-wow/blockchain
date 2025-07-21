import {
  EventMap,
  TypedEventEmitter,
} from '../event_emitter/TypedEventEmitter.js';

export type MessengerMessage = {
  command: string;
  data: unknown;
};

export class Messenger<T extends EventMap> extends TypedEventEmitter<T> {
  handleMessage(message: MessengerMessage): void {
    this.emit(
      message.command as keyof T,
      ...(message.data as Parameters<T[keyof T]>),
    );
  }
}
