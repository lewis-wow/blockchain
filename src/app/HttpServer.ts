import { Hono } from 'hono';
import { log as defaultLog } from '../utils/logger.js';
import { zValidator } from '@hono/zod-validator';
import { BlockChain } from '../blockchain/BlockChain.js';
import z from 'zod';
import { serve } from '@hono/node-server';
import { ServerAddressInfo } from '../utils/ServerAddressInfo.js';
import { P2pServer } from './P2pServer.js';
import { TransactionPool } from '../cryptocurrency/TransactionPool.js';
import { Wallet } from '../cryptocurrency/Wallet.js';
import { Miner } from './Miner.js';

const SERVICE_NAME = 'http-server';

const log = defaultLog.child({ serviceName: SERVICE_NAME });

export type HttpServerOptions = {
  blockChain: BlockChain;
  p2pServer: P2pServer;
  transactionPool: TransactionPool;
  wallet: Wallet;
  miner: Miner;
};

export type ListenArgs = {
  port?: number;
};

export class HttpServer {
  private blockChain: BlockChain;
  private transactionPool: TransactionPool;
  private wallet: Wallet;
  private p2pServer: P2pServer;
  private miner: Miner;

  private app = new Hono();

  constructor(opts: HttpServerOptions) {
    this.blockChain = opts.blockChain;
    this.transactionPool = opts.transactionPool;
    this.wallet = opts.wallet;
    this.p2pServer = opts.p2pServer;
    this.miner = opts.miner;

    this.app.get('/blocks', (c) => {
      return c.json(this.blockChain.getChain());
    });

    this.app.post(
      '/mine',
      zValidator('json', z.record(z.string(), z.any())),
      (c) => {
        const data = c.req.valid('json');

        const newBlock = this.blockChain.addBlock(data);
        this.p2pServer.syncChains();

        return c.json(newBlock.toJSON());
      },
    );

    this.app.get('/transactions', (c) => {
      return c.json(
        this.transactionPool
          .getTransactions()
          .map((transaction) => transaction.toJSON()),
      );
    });

    this.app.post(
      '/transaction',
      zValidator(
        'json',
        z.object({
          amount: z.number().min(0),
          recipient: z.string(),
        }),
      ),
      (c) => {
        const { amount, recipient } = c.req.valid('json');

        const transaction = this.wallet.createTransaction({
          amount,
          recipientAddress: recipient,
          transactionPool: this.transactionPool,
        });

        this.p2pServer.broadcastTransactions(transaction);

        return c.json(transaction.toJSON());
      },
    );

    this.app.post('/mine-transactions', (c) => {
      const block = this.miner.mine();

      return c.json(block.toJSON());
    });

    this.app.get('/public-key', (c) => {
      return c.json({
        publicKey: this.wallet.publicKey,
      });
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
