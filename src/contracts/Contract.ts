import { z } from 'zod';
import { JSONData } from '../types.js';
import { RawData } from 'ws';

export type ContractOptions<T, S extends JSONData, TType extends string> = {
  parse?: (data: S) => T;
  serialize?: (data: T) => S;
  type: TType;
};

export class Contract<
  TType extends string = string,
  T = undefined,
  S extends JSONData = undefined,
> {
  private _parse?: (data: S) => T;
  private _serialize?: (data: T) => S;
  public type: TType;

  constructor(opts: ContractOptions<T, S, TType>) {
    this._parse = opts.parse;
    this._serialize = opts.serialize;
    this.type = opts.type;
  }

  parse(data: S): T {
    return this._parse?.(data) as T;
  }

  serialize(data: T extends undefined ? T | void : T): S {
    return this._serialize?.(data as T) as S;
  }

  stringify(data: T extends undefined ? T | void : T): string {
    return JSON.stringify(this.serialize(data));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  is(shape: { type: string; data?: any }): shape is { type: TType; data: S } {
    return shape.type === this.type;
  }

  static parse(
    message: string | RawData,
  ): z.SafeParseReturnType<
    z.infer<typeof Contract.BASE_ENVELOP_SCHEMA>,
    z.infer<typeof Contract.BASE_ENVELOP_SCHEMA>
  > {
    return Contract.BASE_ENVELOP_SCHEMA.safeParse(
      JSON.parse(message.toString()),
    );
  }

  static readonly BASE_ENVELOP_SCHEMA = z.object({
    type: z.string(),
    data: z.any(),
  });

  static readonly $BASE_ENVELOP: z.infer<typeof Contract.BASE_ENVELOP_SCHEMA>;
}
