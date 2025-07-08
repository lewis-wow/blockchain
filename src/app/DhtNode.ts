import { HOSTNAME } from '../config.js';
import { sha256 } from '../utils/sha256.js';
import { WebSocketHandler } from '../utils/WebSocketHandler.js';

export type DhtNodeOptions = {
  port: number;
};

export class DhtNode extends WebSocketHandler {
  private address: string;
  private id: string;
  private store = new Map<string, unknown>();

  // nodeId -> address
  private routingTable = new Map<string, string>();

  constructor(opts: DhtNodeOptions) {
    super();

    this.address = `ws://${HOSTNAME}:${opts.port}`;
    this.id = sha256(this.address);
  }
}
