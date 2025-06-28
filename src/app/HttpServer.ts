import { Hono } from 'hono';
import { log as defaultLog } from '../utils/logger.js';
import { zValidator } from '@hono/zod-validator';
import { BlockChain } from '../blockchain/BlockChain.js';
import z from 'zod';
import { serve } from '@hono/node-server';
import { ServerAddressInfo } from '../utils/ServerAddressInfo.js';

const SERVICE_NAME = 'http-server';

const log = defaultLog.child({ serviceName: SERVICE_NAME });

export type HttpServerOptions = {
  blockChain: BlockChain;
};

export type ListenArgs = {
  port?: number;
};

export class HttpServer {
  private blockChain: BlockChain;
  private app: Hono;

  constructor(opts: HttpServerOptions) {
    this.blockChain = opts.blockChain;
    this.app = new Hono();

    this.app.get('/blocks', (c) => {
      return c.json(this.blockChain.getChain());
    });

    this.app.post('/mine', zValidator('json', z.record(z.unknown())), (c) => {
      const data = c.req.valid('json');

      const newBlock = this.blockChain.addBlock(data);

      return c.json(newBlock.toJSON());
    });
  }

  listen({ port }: ListenArgs): void {
    serve(
      {
        fetch: this.app.fetch,
        port,
      },
      (addressInfo) => {
        const serverAddressInfo = ServerAddressInfo.parse(addressInfo, 'http');

        log.info(`Server running on ${serverAddressInfo.toString()}`);
      },
    );
  }
}
