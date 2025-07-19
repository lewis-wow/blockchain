import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { Contact } from '../Contact.js';
import { NetworkListenableNode } from '../network_node/NetworkListenableNode.js';

export type HttpServerEventMap = {
  listening: () => void;
};

/**
 * Represents an HTTP server node capable of listening for incoming HTTP requests.
 * It extends `NetworkListenableNode` to inherit network node properties and listening capabilities.
 * This class uses the Hono web framework for routing and handling HTTP requests.
 */
export class HttpServer extends NetworkListenableNode<HttpServerEventMap> {
  /**
   * The Hono application instance, which acts as the router and request handler for the HTTP server.
   * Publicly accessible to allow external modules to define routes and middleware.
   */
  public app = new Hono();

  /**
   * Constructs an instance of HttpServer.
   * @param selfContact - The contact information for this HTTP server node, including its host and port.
   */
  constructor(selfContact: Contact) {
    super(selfContact); // Call the parent constructor to initialize `selfContact`
  }

  /**
   * Implements the abstract `listen` method from `NetworkListenableNode`.
   * This method starts the HTTP server, binding it to the host and port specified in `selfContact`.
   * It uses `@hono/node-server`'s `serve` function to integrate Hono with Node.js HTTP server.
   * @override
   */
  override listen(): void {
    serve(
      {
        fetch: this.app.fetch, // Hono's `app.fetch` method is used as the request handler
        hostname: this.selfContact.address, // Bind the server to the specified host
        port: this.selfContact.port, // Bind the server to the specified port
      },
      () => {
        this.emit('listening');
      },
    );
  }
}
