import { z } from 'zod';
import { JSONData } from '../types.js';
import { RawData } from 'ws';

export type ContractOptions<T, S extends JSONData, TType extends string> = {
  parse: (data: S) => T;
  serialize: (data: T) => S;
  type: TType;
};

export class Contract<T, S extends JSONData, TType extends string> {
  private _parse: (data: S) => T;
  private _serialize: (data: T) => S;
  public type: TType;

  constructor(opts: ContractOptions<T, S, TType>) {
    this._parse = opts.parse;
    this._serialize = opts.serialize;
    this.type = opts.type;
  }

  parse(data: S): T {
    return this._parse(data);
  }

  serialize(data: T): S {
    return this._serialize(data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  is(shape: { type: string; data?: any }): shape is { type: TType; data: T } {
    return shape.type === this.type;
  }

  static parse(message: string | RawData) {
    return Contract.baseMessageEnvelopSchema.safeParse(
      JSON.parse(message.toString()),
    );
  }

  static readonly baseMessageEnvelopSchema = z.object({
    type: z.string(),
    data: z.any(),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyContract = Contract<any, JSONData, string>;
