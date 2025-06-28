import type { AddressInfo } from 'node:net';

export type ServerAddressInfoOptions = {
  protocol: string;
  host: string;
  path?: string;
  port?: number;
  family?: string;
};

export class ServerAddressInfo {
  protocol: string;
  host: string;
  path?: string;
  port?: number;
  family?: string;

  constructor(opts: ServerAddressInfoOptions) {
    this.protocol = opts.protocol;
    this.host = opts.host;
    this.path = opts.path;
    this.port = opts.port;
    this.family = opts.family;
  }

  toString(): string {
    return `${this.protocol}://${this.host}${this.port ? `:${this.port}` : ''}${this.path ?? ''}`;
  }

  static parse(
    addr: string | AddressInfo,
    protocol: string,
  ): ServerAddressInfo {
    if (typeof addr === 'string') {
      // UNIX socket or named pipe
      return new ServerAddressInfo({
        host: 'localhost',
        path: addr,
        protocol,
      });
    }

    if (typeof addr === 'object' && addr !== null) {
      let host = addr.address;

      // Normalize IPv6 unspecified address to 'localhost'
      if (host === '::' || host === '::1') {
        host = 'localhost';
      }

      return new ServerAddressInfo({
        host,
        port: addr.port,
        family: addr.family,
        protocol,
      });
    }

    // Fallback
    return new ServerAddressInfo({
      host: 'unknown',
      port: 0,
      protocol,
    });
  }
}
