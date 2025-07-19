import { NetworkListenableNode } from './NetworkListenableNode.js';

/**
 * Abstract base class for a network node that is publicly accessible and can provide its address.
 * Extends `NetworkListenableNode` by adding an abstract `getAddress` method.
 */
export abstract class NetworkAddresableNode extends NetworkListenableNode {
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
