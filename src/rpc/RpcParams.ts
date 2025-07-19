import { Contact } from '../Contact.js';
import { Serializable } from '../Serializable.js';
import { JSONData, JSONObject } from '../types.js';

/**
 * Defines the options required to create an `RpcParams` instance.
 * @template T - The type of the data contained within the RPC message, which must extend `JSONData`.
 * @property data - The actual data payload of the RPC message.
 * @property contact - The `Contact` information of the sender or recipient related to the RPC message.
 */
export type RpcMessageOptions<T> = {
  readonly data: T;
  readonly contact: Contact;
};

/**
 * Represents the parameters sent or received in an RPC (Remote Procedure Call) message.
 * This class encapsulates both a generic data payload and the contact information associated with the message.
 * It extends `Serializable` to allow for conversion to and from JSON.
 * @template T - The type of the data payload, defaulting to `JSONData`.
 */
export class RpcParams<T extends JSONData = JSONData> extends Serializable {
  /**
   * The data payload carried within the RPC message.
   * @readonly
   */
  readonly data: T;
  /**
   * The contact information associated with this RPC message, typically the sender's contact.
   * @readonly
   */
  readonly contact: Contact;

  /**
   * Constructs an instance of `RpcParams`.
   * @param opts - An object containing the data payload and contact information.
   */
  constructor(opts: RpcMessageOptions<T>) {
    super(); // Call the constructor of the parent `Serializable` class

    this.data = opts.data;
    this.contact = opts.contact;
  }

  /**
   * Converts the `RpcParams` instance into a `JSONObject` for serialization.
   * The `contact` property is also converted to its JSON representation.
   * @returns {JSONObject} A JSON object representing the `RpcParams` instance.
   * @override
   */
  override toJSON(): JSONObject {
    return {
      data: this.data,
      contact: this.contact.toJSON(), // Serialize the Contact object
    };
  }

  /**
   * Creates a new `RpcParams` instance from a `JSONObject`.
   * This static method is used for deserialization. It reconstructs the `Contact` object from its JSON representation.
   * @template T - The expected type of the data payload.
   * @param {JSONObject} jsonObject - The JSON object to deserialize.
   * @returns {RpcParams<T>} A new `RpcParams` instance.
   * @override
   */
  static override fromJSON<T extends JSONData = JSONData>(
    jsonObject: JSONObject,
  ): RpcParams<T> {
    return new RpcParams<T>({
      data: jsonObject.data as T, // Cast the data back to its original type T
      contact: Contact.fromJSON(jsonObject.contact as JSONObject), // Deserialize the Contact object
    });
  }
}
