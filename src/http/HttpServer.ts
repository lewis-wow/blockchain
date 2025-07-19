import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { Contact } from '../Contact.js';
import { NetworkListenableNode } from '../network_node/NetworkListenableNode.js';

export class HttpServer extends NetworkListenableNode {
  public app = new Hono();

  constructor(selfContact: Contact) {
    super(selfContact);
  }

  override listen(): void {
    serve(
      {
        fetch: this.app.fetch,
        hostname: this.selfContact.host,
        port: this.selfContact.port,
      },
      () => {
        this.emit('listening');
      },
    );
  }
}
