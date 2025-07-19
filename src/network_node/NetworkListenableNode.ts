import { NetworkNode } from './NetworkNode.js';

/**
 * Abstract base class for a network node that is capable of listening for incoming connections or messages.
 * Extends `NetworkNode` by adding an abstract `listen` method.
 */
export abstract class NetworkListenableNode extends NetworkNode {
  /**
   * Abstract method that must be implemented by concrete subclasses.
   * This method defines the logic for the node to start listening for network activity.
   */
  abstract listen(): void;
}
