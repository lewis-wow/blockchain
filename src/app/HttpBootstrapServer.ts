import { Hono } from 'hono';
import { log as defaultLog } from '../utils/logger.js';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { serve } from '@hono/node-server';
import { BOOTSTRAP_SERVER_PROTOCOL, HOSTNAME } from '../config.js';

const SERVICE_NAME = 'bootstrap-server';

const log = defaultLog.child({ serviceName: SERVICE_NAME });

export type ListenArgs = {
  port?: number;
};

export class HttpBootstrapServer {
  private app = new Hono();
  private peers: string[] = [];

  constructor() {
    this.app.get('/peers', (c) => {
      return c.json(this.peers);
    });

    this.app.post(
      '/register',
      zValidator(
        'json',
        z.object({
          address: z.string(),
        }),
      ),
      (c) => {
        const { address } = c.req.valid('json');

        this.peers.push(address);

        return c.json(this.peers);
      },
    );
  }

  listen({ port }: ListenArgs): void {
    serve(
      {
        fetch: this.app.fetch,
        hostname: HOSTNAME,
        port,
      },
      () => {
        log.info(
          `Bootstrap server running on ${BOOTSTRAP_SERVER_PROTOCOL}://${HOSTNAME}:${port}`,
        );
      },
    );
  }
}
