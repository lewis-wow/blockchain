import { RoutingTable } from './RoutingTable.js';
import { RpcServer } from '../rpc/RpcServer.js';
import { ALPHA } from '../consts.js';
import { Utils } from '../Utils.js';
import { Contact } from '../Contact.js';
import { JSONObject } from '../types.js';
import { NetworkListenableNode } from '../network_node/NetworkListenableNode.js';

const SERVICE_NAME = 'kademlia-server';
const log = Utils.defaultLog.child({ serviceName: SERVICE_NAME });

export type KademliaServerRpcProcedureMap = {
  PING: () => { pong: true };
  FIND_NODE_REQUEST: (args: { targetId: string }) => { contacts: JSONObject[] };
};

/**
 * Represents a Kademlia node in the network.
 */
export class KademliaServer extends NetworkListenableNode {
  public readonly routingTable: RoutingTable;
  private readonly rpc: RpcServer<KademliaServerRpcProcedureMap>;

  constructor(selfContact: Contact) {
    super(selfContact);

    this.routingTable = new RoutingTable(this.selfContact.nodeId);
    this.rpc = new RpcServer(this.selfContact);
    this.setupRpcHandlers();
  }

  override listen(): void {
    this.rpc.listen();

    this.routingTable.on('contactAdded', (contact) => {
      log.info(
        `New contact added: ${contact.port} (${contact.nodeId.toString('hex').substring(0, 6)})`,
      );
    });

    log.info('Bootstrap server network id:', this.getNetworkIdentifier());
  }

  private setupRpcHandlers(): void {
    // A node should always add the sender to its routing table
    this.rpc.on('seen', (contact: Contact) => {
      this.routingTable.addContact(contact);
    });

    this.rpc.addMethod({
      method: 'PING',
      handler: () => {
        return {
          pong: true,
        };
      },
    });

    this.rpc.addMethod({
      method: 'FIND_NODE_REQUEST',
      handler: (params) => {
        const closest = this.routingTable.findClosest(params.data.targetId);

        return {
          contacts: closest.map((contact) => contact.toJSON()),
        };
      },
    });
  }

  /**
   * Pings a remote node to see if it's alive.
   */
  public async ping(contact: Contact): Promise<boolean> {
    try {
      const response = await this.rpc.request({
        contact,
        method: 'PING',
      });

      return response.data.pong === true;
    } catch (error) {
      log.error(`Ping failed for ${contact.address}:${contact.port}`, error);
      return false;
    }
  }

  /**
   * Iteratively finds the k-closest nodes to a target ID.
   * This is the core of the peer discovery mechanism.
   */
  public async findNode(targetId: string): Promise<Contact[]> {
    const closestNodes = this.routingTable.findClosest(targetId, ALPHA);
    const queriedNodes = new Set<string>([this.selfContact.nodeId]);

    const find = async (): Promise<void> => {
      const nodesToQuery = closestNodes.filter(
        (n) => !queriedNodes.has(n.nodeId),
      );

      if (nodesToQuery.length === 0) {
        return; // No new nodes to query
      }

      // Mark as queried
      nodesToQuery.forEach((n) => queriedNodes.add(n.nodeId));

      const promises = nodesToQuery.map((contact) =>
        this.rpc.request({
          contact,
          method: 'FIND_NODE_REQUEST',
          data: {
            targetId,
          },
        }),
      );

      const results = await Promise.allSettled(promises);
      let foundNewNodes = false;

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const response = result.value;
          const newContacts = response.data.contacts.map((contact) =>
            Contact.fromJSON(contact),
          );

          newContacts.forEach((contact) => {
            this.routingTable.addContact(contact);
            const isNew = !closestNodes.some(
              (n) => n.nodeId === contact.nodeId,
            );

            if (isNew) {
              closestNodes.push(contact);
              foundNewNodes = true;
            }
          });
        }
      });

      // Sort by distance and keep the best
      closestNodes.sort((a, b) => {
        return a.nodeId.localeCompare(b.nodeId);
      });

      if (foundNewNodes) {
        await find(); // Recurse
      }
    };

    await find();
    return this.routingTable.findClosest(targetId);
  }

  /**
   * Bootstraps the node by connecting to a known peer.
   */
  public async bootstrap(bootstrapContact: Contact): Promise<void> {
    log.info(
      `[${this.selfContact.port}] Bootstrapping to ${bootstrapContact.port}...`,
    );

    this.routingTable.addContact(bootstrapContact);
    // Discover other nodes by performing a lookup for our own ID
    await this.findNode(this.selfContact.nodeId);
    log.info(`[${this.selfContact.port}] Bootstrap complete.`);
  }
}
