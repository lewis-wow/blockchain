import { Serializable } from './Serializable.js';
import { JSONObject } from './types.js';

export type ContactOptions = {
  nodeId: Buffer;
  host: string;
  port: number;
};

export class Contact extends Serializable {
  readonly nodeId: Buffer;
  readonly host: string;
  readonly port: number;

  constructor(opts: ContactOptions) {
    super();

    this.nodeId = opts.nodeId;
    this.host = opts.host;
    this.port = opts.port;
  }

  override toJSON(): JSONObject {
    return {
      nodeId: this.nodeId.toString('hex'),
      port: this.port,
      host: this.host,
    };
  }

  static override fromJSON(json: JSONObject): Contact {
    return new Contact({
      nodeId: Buffer.from(json.nodeId as string, 'hex'),
      port: json.port as number,
      host: json.host as string,
    });
  }
}
