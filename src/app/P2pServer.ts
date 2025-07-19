import { BlockChain } from '../blockchain/BlockChain.js';
import { TransactionPool } from '../cryptocurrency/TransactionPool.js';
import { Transaction } from '../cryptocurrency/Transaction.js';
import { Utils } from '../Utils.js';
import { RpcServer } from '../rpc/RpcServer.js';
import { KademliaServer } from '../kademlia/KademliaServer.js';
import { JSONObject } from '../types.js';
import { Contact } from '../Contact.js';
import { NetworkListenableNode } from '../network_node/NetworkListenableNode.js';
import { RpcParams } from '../rpc/RpcParams.js';

const SERVICE_NAME = 'p2p-server';
const log = Utils.defaultLog.child({ serviceName: SERVICE_NAME });

export type P2pServerOptions = {
  blockChain: BlockChain;
  transactionPool: TransactionPool;
  kademliaServer: KademliaServer;
};

export type P2pServerRpcProcedureMap = {
  SYNC_CHAIN: () => { chain: JSONObject[] };
  BROADCAST_TRANSACTION: (args: { transaction: JSONObject }) => void;
  BROADCAST_CLEAR_TRANSACTIONS: () => void;
};

export class P2pServer extends NetworkListenableNode {
  private blockChain: BlockChain;
  private transactionPool: TransactionPool;
  private rpc: RpcServer<P2pServerRpcProcedureMap>;
  private kademliaServer: KademliaServer;

  constructor(selfContact: Contact, opts: P2pServerOptions) {
    super(selfContact);

    this.blockChain = opts.blockChain;
    this.transactionPool = opts.transactionPool;
    this.rpc = new RpcServer(selfContact);
    this.kademliaServer = opts.kademliaServer;
  }

  override listen(): void {
    this.setupRpcHandlers();
    this.rpc.listen();

    log.info('Peer-to-peer server network id:', this.getNetworkIdentifier());
  }

  /**
   * Sets up handlers for application-specific RPC messages.
   */
  private setupRpcHandlers(): void {
    this.rpc.addMethod({
      method: 'SYNC_CHAIN',
      handler: () => {
        return {
          chain: this.blockChain.getChain().map((block) => block.toJSON()),
        };
      },
    });

    this.rpc.addMethod({
      method: 'BROADCAST_TRANSACTION',
      handler: (params: RpcParams<{ transaction: JSONObject }>) => {
        const transaction = Transaction.fromJSON(params.data.transaction);
        this.transactionPool.updateOrAddTransaction(transaction);
      },
    });

    this.rpc.addMethod({
      method: 'BROADCAST_CLEAR_TRANSACTIONS',
      handler: () => {
        this.transactionPool.clear();
      },
    });
  }

  /**
   * Requests the latest blockchain from all known peers and replaces the local
   * chain if a longer, valid chain is found.
   */
  public async syncChains(): Promise<void> {
    const peers = this.kademliaServer.routingTable.getAllContacts();

    const responses = await this.rpc.broadcastRequest({
      method: 'SYNC_CHAIN',
      contacts: peers,
    });

    for (const response of responses) {
      const remoteChain = BlockChain.fromJSON(response.data.chain);
      this.blockChain.replaceChain(remoteChain.getChain());
    }
  }

  /**
   * Broadcasts a new transaction to all known peers in the network.
   */
  public async broadcastTransaction(transaction: Transaction): Promise<void> {
    const peers = this.kademliaServer.routingTable.getAllContacts();

    this.rpc.broadcastNotify({
      method: 'BROADCAST_TRANSACTION',
      contacts: peers,
      data: {
        transaction: transaction.toJSON(),
      },
    });
  }

  /**
   * Broadcasts a message to clear the transaction pool to all known peers.
   */
  public async broadcastClearTransactions(): Promise<void> {
    const peers = this.kademliaServer.routingTable.getAllContacts();

    this.rpc.broadcastNotify({
      method: 'BROADCAST_CLEAR_TRANSACTIONS',
      contacts: peers,
    });
  }
}
