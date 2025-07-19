import { Serializable } from './Serializable.js';
import { JSONObject } from './types.js';

/**
 * Defines the options required to create a Contact instance.
 * @property nodeId - The unique identifier of the node.
 * @property host - The host address (e.g., IP address or hostname) of the node.
 * @property port - The port number on which the node is listening.
 */
export type ContactOptions = {
  nodeId: string;
  address: string;
  port: number;
};

/**
 * Represents the contact information for a network node, including its ID, host, and port.
 * This class extends `Serializable` to support JSON serialization and deserialization.
 */
export class Contact extends Serializable {
  /**
   * The unique identifier of the node.
   */
  readonly nodeId: string;
  /**
   * The host address (e.g., IP address or hostname) of the node.
   */
  readonly address: string;
  /**
   * The port number on which the node is listening.
   */
  readonly port: number;

  /**
   * Creates an instance of Contact.
   * @param opts - An object containing the node ID, host, and port.
   */
  constructor(opts: ContactOptions) {
    super();

    this.nodeId = opts.nodeId;
    this.address = opts.address;
    this.port = opts.port;
  }

  /**
   * Converts the Contact instance into a JSON object.
   * @returns A JSON object representation of the contact.
   */
  override toJSON(): JSONObject {
    return {
      nodeId: this.nodeId,
      port: this.port,
      address: this.address,
    };
  }

  /**
   * Creates a new Contact instance from a JSON object.
   * @param json - The JSON object to deserialize into a Contact.
   * @returns A new Contact instance.
   */
  static override fromJSON(json: JSONObject): Contact {
    return new Contact({
      nodeId: json.nodeId as string,
      port: json.port as number,
      address: json.address as string,
    });
  }
}
