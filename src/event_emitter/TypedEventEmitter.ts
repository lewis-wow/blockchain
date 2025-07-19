import { EventEmitter } from 'node:events';
import { EventMap, ITypedEventEmitter } from './ITypedEventEmitter.js';

export abstract class TypedEventEmitter<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  T extends EventMap = {},
> extends (EventEmitter as {
  new <T extends EventMap>(): ITypedEventEmitter<T>;
})<T> {}

export type { EventMap };
