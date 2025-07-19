import { JSONData } from './types.js';

/**
 * An abstract base class defining a contract for objects that can be serialized to and deserialized from JSON.
 * Classes extending `Serializable` must implement the `toJSON` method.
 */
export abstract class Serializable {
  /**
   * Abstract method that concrete subclasses must implement to convert the object into a JSON-compatible data structure.
   * @returns {JSONData} A JSON-compatible representation of the object.
   */
  abstract toJSON(): JSONData;

  /**
   * Static method for deserializing a JSONData object back into a Serializable instance.
   * This method is intended to be overridden by subclasses to provide their specific deserialization logic.
   * If not overridden, calling this method will throw an error, indicating that implementation is missing.
   * @param {JSONData} data - The JSON data to be deserialized.
   * @returns {Serializable} A new instance of the Serializable class (or its subclass).
   * @throws {Error} If the method is not implemented by the subclass. The `cause` property of the error will contain the `data` that failed to be deserialized.
   */
  static fromJSON(data: JSONData): Serializable {
    throw new Error('fromJSON method was not implemented.', {
      cause: data,
    });
  }
}
