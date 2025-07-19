import { BlockChain } from '../blockchain/BlockChain.js';
import { HOSTNAME } from '../consts.js';
import { Contact } from '../Contact.js';
import { Miner } from '../cryptocurrency/Miner.js';
import { TransactionPool } from '../cryptocurrency/TransactionPool.js';
import { Wallet } from '../cryptocurrency/Wallet.js';
import { KademliaServer } from '../kademlia/KademliaServer.js';
import { Utils } from '../Utils.js';
import { ApiServer } from './ApiServer.js';
import { P2pServer } from './P2pServer.js';

const SERVICE_NAME = 'app';
const log = Utils.defaultLog.child({ serviceName: SERVICE_NAME });

export type AppOptions = {
  basePort?: number;
  bootstrap?: string;
};

export class App {
  private readonly nodeId: string;
  private readonly basePort: number;
  private readonly address: string;

  private blockChain = new BlockChain();
  private wallet = new Wallet();
  private transactionPool = new TransactionPool();
  private miner: Miner;

  private kademliaServer: KademliaServer;
  private apiServer: ApiServer;
  private p2pServer: P2pServer;

  constructor(opts: AppOptions) {
    this.basePort = opts.basePort ?? App.DEFAULT_BASE_PORT;
    this.nodeId = Utils.createNodeId();
    this.address = HOSTNAME;

    this.initializeKademliaServer();
    this.initializeP2pServer();
    this.initializeMiner();
    this.initializeApiServer();
  }

  private initializeKademliaServer(): void {
    this.kademliaServer = new KademliaServer(
      this.createServiceContact(this.basePort + 2000),
    );
  }

  private initializeP2pServer(): void {
    this.p2pServer = new P2pServer(
      this.createServiceContact(this.basePort + 1000),
      {
        blockChain: this.blockChain,
        transactionPool: this.transactionPool,
        kademliaServer: this.kademliaServer,
      },
    );
  }

  private initializeMiner(): void {
    this.miner = new Miner({
      p2pServer: this.p2pServer,
      blockChain: this.blockChain,
      transactionPool: this.transactionPool,
      wallet: this.wallet,
    });
  }

  private initializeApiServer(): void {
    this.apiServer = new ApiServer(this.createServiceContact(this.basePort), {
      blockChain: this.blockChain,
      wallet: this.wallet,
      p2pServer: this.p2pServer,
      miner: this.miner,
      transactionPool: this.transactionPool,
    });
  }

  private createServiceContact(port: number): Contact {
    return new Contact({
      nodeId: this.nodeId,
      address: this.address,
      port,
    });
  }

  listen(): void {
    this.kademliaServer.listen();
    this.p2pServer.listen();
    this.apiServer.listen();

    log.info(
      `Bootstrap server network id: ${this.kademliaServer.getNetworkIdentifier()}`,
    );
  }

  static readonly DEFAULT_BASE_PORT = 3000;
}
