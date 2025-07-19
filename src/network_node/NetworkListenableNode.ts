import { EventMap } from '../event_emitter/ITypedEventEmitter.js';
import { NetworkNode } from './NetworkNode.js';

/**
 * Abstract base class for a network node that is capable of listening for incoming connections or messages.
 * Extends `NetworkNode` by adding an abstract `listen` method.
 */
export abstract class NetworkListenableNode<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  T extends EventMap = {},
> extends NetworkNode<T> {
  /**
   * Abstract method that must be implemented by concrete subclasses.
   * This method defines the logic for the node to start listening for network activity.
   */
  abstract listen(): void;
}
