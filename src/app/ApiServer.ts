import { zValidator } from '@hono/zod-validator';
import { BlockChain } from '../blockchain/BlockChain.js';
import z from 'zod';
import { P2pServer } from './P2pServer.js';
import { TransactionPool } from '../cryptocurrency/TransactionPool.js';
import { Wallet } from '../cryptocurrency/Wallet.js';
import { Miner } from '../cryptocurrency/Miner.js';
import { HttpServer } from '../http/HttpServer.js';
import { Utils } from '../Utils.js';
import { Contact } from '../Contact.js';
import { NetworkAddresableNode } from '../network_node/NetworkAddresableNode.js';

const SERVICE_NAME = 'api-server';
const log = Utils.defaultLog.child({ serviceName: SERVICE_NAME });

export type ApiServerOptions = {
  blockChain: BlockChain;
  p2pServer: P2pServer;
  transactionPool: TransactionPool;
  wallet: Wallet;
  miner: Miner;
};

export class ApiServer extends NetworkAddresableNode {
  private blockChain: BlockChain;
  private transactionPool: TransactionPool;
  private wallet: Wallet;
  private p2pServer: P2pServer;
  private miner: Miner;
  private httpServer: HttpServer;

  constructor(selfContact: Contact, opts: ApiServerOptions) {
    super(selfContact);

    this.blockChain = opts.blockChain;
    this.transactionPool = opts.transactionPool;
    this.wallet = opts.wallet;
    this.p2pServer = opts.p2pServer;
    this.miner = opts.miner;
    this.httpServer = new HttpServer(this.selfContact);

    this.httpServer.app.get('/blocks', (c) => {
      return c.json(this.blockChain.getChain());
    });

    this.httpServer.app.post(
      '/mine',
      zValidator('json', z.record(z.string(), z.any())),
      (c) => {
        const data = c.req.valid('json');

        const newBlock = this.blockChain.addBlock(data);
        this.p2pServer.syncChains();

        return c.json(newBlock.toJSON());
      },
    );

    this.httpServer.app.get('/transactions', (c) => {
      return c.json(
        this.transactionPool
          .getTransactions()
          .map((transaction) => transaction.toJSON()),
      );
    });

    this.httpServer.app.post(
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
          blockChain: this.blockChain,
        });

        this.p2pServer.broadcastTransaction(transaction);

        return c.json(transaction.toJSON());
      },
    );

    this.httpServer.app.post('/mine-transactions', (c) => {
      const block = this.miner.mine();

      return c.json(block.toJSON());
    });

    this.httpServer.app.get('/public-key', (c) => {
      return c.json({
        publicKey: this.wallet.publicKey,
      });
    });
  }

  override getAddress(): string {
    return `http://${this.selfContact.address}:${this.selfContact.port}`;
  }

  override listen(): void {
    this.httpServer.listen();
    log.info(`API server listening on ${this.getAddress()}`);
  }
}
