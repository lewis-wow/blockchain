import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { Contact, Server } from '../server/Server.js';
import { Utils } from '../Utils.js';

const SERVICE_NAME = 'http-server';
const log = Utils.defaultLog.child({ serviceName: SERVICE_NAME });

export class HttpServer extends Server {
  public app = new Hono();

  constructor(selfContact: Contact) {
    super(selfContact);
  }

  override getAddress(): string {
    return `http:${super.getAddress()}`;
  }

  override listen(): void {
    serve(
      {
        fetch: this.app.fetch,
        hostname: this.selfContact.host,
        port: this.selfContact.port,
      },
      () => {
        log.debug(`HTTP server listening on ${this.getAddress()}`);
        super.listen();
      },
    );
  }
}
