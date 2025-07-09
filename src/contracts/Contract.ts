import { z } from 'zod';
import { JSONData } from '../types.js';
import { RawData } from 'ws';

export type ContractOptions<TType extends string, T, S extends JSONData> = {
  parse?: (data: S) => T;
  serialize?: (data: T) => S;
  type: TType;
};

export type ContractMessage<TType extends string, S extends JSONData> = {
  type: TType;
  data: S;
};

export type AnyContractMessage = ContractMessage<string, JSONData>;

export class Contract<
  TType extends string = string,
  T = undefined,
  S extends JSONData = undefined,
> {
  private _parse?: (data: S) => T;
  private _serialize?: (data: T) => S;
  public type: TType;

  constructor(opts: ContractOptions<TType, T, S>) {
    this._parse = opts.parse;
    this._serialize = opts.serialize;
    this.type = opts.type;
  }

  parse(data: S): T {
    return this._parse?.(data) as T;
  }

  serialize(
    data: T extends undefined ? T | void : T,
  ): ContractMessage<TType, S> {
    return {
      type: this.type,
      data: this._serialize?.(data as T) as S,
    };
  }

  stringify(data: T extends undefined ? T | void : T): string {
    return JSON.stringify(this.serialize(data));
  }

  is(shape: {
    type?: string;
    data?: unknown;
  }): shape is { type: TType; data: S } {
    return shape?.type === this.type;
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
