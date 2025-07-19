import { EventMap } from '../event_emitter/ITypedEventEmitter.js';
import { NetworkListenableNode } from './NetworkListenableNode.js';

/**
 * Abstract base class for a network node that is publicly accessible and can provide its address.
 * Extends `NetworkListenableNode` by adding an abstract `getAddress` method.
 */
export abstract class NetworkAddresableNode<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  T extends EventMap = {},
> extends NetworkListenableNode<T> {
  /**
   * Abstract method that must be implemented by concrete subclasses.
   * This method should return the public address of the network node.
   * @returns {string} A string representing the public address of the node.
   * @example
   * ```typescript
   * "http://localhost:3000"
   * ```
   */
  abstract getAddress(): string;
}
