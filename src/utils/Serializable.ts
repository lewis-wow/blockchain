export type SerializableData =
  | Record<string, unknown>
  | Record<string, unknown>[];

export abstract class Serializable {
  abstract toJSON(): SerializableData;

  static fromJSON(data: SerializableData): Serializable {
    throw new Error('fromJSON method was not implemented.', {
      cause: data,
    });
  }
}
