import { BlockChain } from '../blockchain/BlockChain.js';
import { TransactionPool } from '../cryptocurrency/TransactionPool.js';
import { Transaction } from '../cryptocurrency/Transaction.js';
import { Utils } from '../Utils.js';
import { RpcServer } from '../rpc/RpcServer.js';
import { KademliaServer } from '../kademlia/KademliaServer.js';
import { JSONArray, JSONObject } from '../types.js';
import { Contact } from '../Contact.js';
import { RpcMessage } from '../RpcMessage.js';
import { NetworkListenableNode } from '../network_node/NetworkListenableNode.js';

const SERVICE_NAME = 'p2p-server';
const log = Utils.defaultLog.child({ serviceName: SERVICE_NAME });

export type P2pServerOptions = {
  blockChain: BlockChain;
  transactionPool: TransactionPool;
  kademliaServer: KademliaServer;
};

export class P2pServer extends NetworkListenableNode {
  private blockChain: BlockChain;
  private transactionPool: TransactionPool;
  private rpc: RpcServer;
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

    log.info(`P2P server listening on ${this.getNetworkIdentifier()}`);
  }

  /**
   * Sets up handlers for application-specific RPC messages.
   */
  private setupRpcHandlers(): void {
    // Handle incoming chain sync requests
    this.rpc.on('SYNC_CHAIN_REQUEST', (message: RpcMessage) => {
      log.debug('Received SYNC_CHAIN_REQUEST');
      // Respond with the current blockchain instance
      this.rpc.respond({
        target: message.sender,
        message,
        type: 'SYNC_CHAIN_RESPONSE',
        payload: {
          chain: this.blockChain,
        },
      });
    });

    // Handle incoming transaction broadcasts
    this.rpc.on(
      'BROADCAST_TRANSACTION',
      (message: RpcMessage<{ transaction: JSONObject }>) => {
        try {
          const transaction = Transaction.fromJSON(message.payload.transaction);
          log.debug('Received BROADCAST_TRANSACTION', transaction);
          this.transactionPool.updateOrAddTransaction(transaction);
        } catch (e) {
          log.error('Failed to handle transaction broadcast', e);
        }
      },
    );

    // Handle clear transaction broadcasts
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.rpc.on('BROADCAST_CLEAR_TRANSACTIONS', (_message: RpcMessage) => {
      log.debug('Received BROADCAST_CLEAR_TRANSACTIONS');
      this.transactionPool.clear();
    });
  }

  /**
   * Requests the latest blockchain from all known peers and replaces the local
   * chain if a longer, valid chain is found.
   */
  public async syncChains(): Promise<void> {
    log.debug('syncChains() initiated.');
    const peers = this.kademliaServer.routingTable.getAllContacts();

    for (const peer of peers) {
      try {
        const response: RpcMessage<{ chain: JSONArray }> =
          await this.rpc.request({
            target: peer,
            type: 'SYNC_CHAIN_REQUEST',
          });

        const remoteChain = BlockChain.fromJSON(response.payload.chain);
        this.blockChain.replaceChain(remoteChain.getChain());
      } catch (e) {
        log.warn(`Failed to sync chain with peer ${peer.host}:${peer.port}`, e);
      }
    }
  }

  /**
   * Broadcasts a new transaction to all known peers in the network.
   */
  public broadcastTransaction(transaction: Transaction): void {
    log.debug('broadcastTransaction()', transaction);
    const peers = this.kademliaServer.routingTable.getAllContacts();
    for (const peer of peers) {
      // This is a "fire-and-forget" request. We don't need a response.
      this.rpc
        .request({
          target: peer,
          type: 'BROADCAST_TRANSACTION',
          payload: {
            transaction: transaction.toJSON(),
          },
        })
        .catch((e) => {
          log.warn(
            `Failed to broadcast transaction to ${peer.host}:${peer.port}`,
            e,
          );
        });
    }
  }

  /**
   * Broadcasts a message to clear the transaction pool to all known peers.
   */
  public broadcastClearTransactions(): void {
    log.debug('broadcastClearTransactions()');
    const peers = this.kademliaServer.routingTable.getAllContacts();
    for (const peer of peers) {
      this.rpc
        .request({ target: peer, type: 'BROADCAST_CLEAR_TRANSACTIONS' })
        .catch((e) => {
          log.warn(
            `Failed to broadcast clear signal to ${peer.host}:${peer.port}`,
            e,
          );
        });
    }
  }
}
