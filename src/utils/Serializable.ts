import { JSONData } from '../types.js';

export abstract class Serializable {
  abstract toJSON(): JSONData;

  static fromJSON(data: JSONData): Serializable {
    throw new Error('fromJSON method was not implemented.', {
      cause: data,
    });
  }
}
