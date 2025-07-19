import { Contact } from '../Contact.js';
import {
  EventMap,
  TypedEventEmitter,
} from '../event_emitter/TypedEventEmitter.js';

/**
 * Abstract base class for a network node.
 * Defines common properties and methods that all network nodes should have.
 */
export abstract class NetworkNode<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  T extends EventMap = {},
> extends TypedEventEmitter<T> {
  /**
   * @param selfContact - The contact information for this network node.
   */
  constructor(protected selfContact: Contact) {
    super();
  }

  /**
   * Retrieves the contact information for this network node.
   * @returns The Contact object representing this node.
   */
  getContact(): Contact {
    return this.selfContact;
  }

  /**
   * Generates a unique network identifier string for this node.
   * The identifier is formatted as "nodeId@address:port".
   * @returns A string representing the network identifier.
   */
  getNetworkIdentifier(): string {
    return `${this.selfContact.nodeId}@${this.selfContact.address}:${this.selfContact.port}`;
  }
}
