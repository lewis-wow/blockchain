import { TypedEventEmitter } from '../event_emitter/TypedEventEmitter.js';

export type StateEventMap<T> = {
  stateChange: (state: T) => void;
};

export type StateMap = Record<string, string> | string[];

type inferStateValue<T extends StateMap> = T extends string[]
  ? T[number]
  : T extends Record<string, string>
    ? keyof T
    : never;

export class State<
  T extends Record<string, string> | string[],
> extends TypedEventEmitter<StateEventMap<inferStateValue<T>>> {
  constructor(private state: inferStateValue<T>) {
    super();
  }

  setState(state: inferStateValue<T>): void {
    this.state = state;
    this.emit('stateChange', this.state);
  }

  getState(): inferStateValue<T> {
    return this.state;
  }
}
