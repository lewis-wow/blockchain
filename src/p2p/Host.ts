import { isIP } from 'node:net';

export class Host {
  readonly host: string;
  readonly port: number;
  readonly version: number;

  constructor(host: string, port?: number) {
    this.host = host;
    this.port = port ?? Host.DEFAULT_PORT;
    this.version = isIP(host);
  }

  static readonly DEFAULT_PORT = 0;
}
