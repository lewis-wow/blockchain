import { Contact } from './Contact.js';
import { Serializable } from './Serializable.js';
import { JSONObject } from './types.js';

export type RpcMessageOptions<TPayload> = {
  type: string;
  payload: TPayload;
  sender: Contact;
  rpcId: string;
};

export class RpcMessage<TPayload = unknown> extends Serializable {
  readonly type: string;
  readonly payload: TPayload;
  readonly sender: Contact;
  readonly rpcId: string;

  constructor(opts: RpcMessageOptions<TPayload>) {
    super();

    this.type = opts.type;
    this.payload = opts.payload;
    this.sender = opts.sender;
    this.rpcId = opts.rpcId;
  }

  override toJSON(): JSONObject {
    return {
      type: this.type,
      payload: JSON.stringify(this.payload),
      sender: this.sender.toJSON(),
      rpcId: this.rpcId,
    };
  }

  static override fromJSON<TPayload = unknown>(
    data: JSONObject,
  ): RpcMessage<TPayload> {
    return new RpcMessage<TPayload>({
      type: data.type as string,
      payload: data.payload as TPayload,
      sender: Contact.fromJSON(data.sender as JSONObject),
      rpcId: data.rpcId as string,
    });
  }
}
