import { HOSTNAME } from '../config.js';
import { sha256 } from '../utils/sha256.js';

export type ServerOptions = {
  port: number;
  protocol: string;
};

export abstract class Server {
  protected address: string;
  protected port: number;
  protected id: string;
  protected protocol: string;

  constructor(opts: ServerOptions) {
    this.port = opts.port;
    this.protocol = opts.protocol;
    this.address = `${this.protocol}://${HOSTNAME}:${this.port}`;
    this.id = sha256(this.address);
  }

  getId(): string {
    return this.id;
  }

  getAddress(): string {
    return this.address;
  }

  abstract listen(handler?: (server: this) => void): void;
}
