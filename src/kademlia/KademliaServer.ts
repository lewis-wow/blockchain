// src/Node.ts

import { RoutingTable } from './RoutingTable.js';
import { RpcMessage, RpcServer } from '../server/RpcServer.js';
import { ALPHA } from '../consts.js';
import { Contact, Server } from '../server/Server.js';
import { Utils } from '../Utils.js';

const SERVICE_NAME = 'kademlia-server';
const log = Utils.defaultLog.child({ serviceName: SERVICE_NAME });

/**
 * Represents a Kademlia node in the network.
 */
export class KademliaServer extends Server {
  public readonly nodeId: Buffer;
  public readonly routingTable: RoutingTable;
  private readonly rpc: RpcServer;

  constructor(selfContact: Contact) {
    super(selfContact);

    this.routingTable = new RoutingTable(this.nodeId);
    this.rpc = new RpcServer(this.selfContact);
    this.setupRpcHandlers();
  }

  override listen(): void {
    this.rpc.listen();

    this.routingTable.on('contactAdded', (contact) => {
      log.info(
        `[${this.selfContact.port}] New contact added: ${contact.port} (${contact.nodeId.toString('hex').substring(0, 6)})`,
      );
    });
  }

  private setupRpcHandlers(): void {
    // A node should always add the sender to its routing table
    this.rpc.on('seen', (contact: Contact) => {
      this.routingTable.addContact(contact);
    });

    this.rpc.on('PING_REQUEST', (message: RpcMessage) => {
      this.rpc.respond({
        target: message.sender,
        message,
        type: 'PING_RESPONSE',
        payload: {
          pong: true,
        },
      });
    });

    this.rpc.on(
      'FIND_NODE_REQUEST',
      (message: RpcMessage<{ targetId: string }>) => {
        const targetId = Buffer.from(message.payload.targetId, 'hex');
        const closest = this.routingTable.findClosest(targetId);
        this.rpc.respond({
          target: message.sender,
          message,
          type: 'FIND_NODE_RESPONSE',
          payload: {
            contacts: closest,
          },
        });
      },
    );
  }

  /**
   * Pings a remote node to see if it's alive.
   */
  public async ping(contact: Contact): Promise<boolean> {
    try {
      const response: RpcMessage<{ pong: true }> = await this.rpc.request({
        target: contact,
        type: 'PING_REQUEST',
      });

      return response.payload.pong === true;
    } catch (error) {
      log.error(`Ping failed for ${contact.host}:${contact.port}`, error);
      return false;
    }
  }

  /**
   * Iteratively finds the k-closest nodes to a target ID.
   * This is the core of the peer discovery mechanism.
   */
  public async findNode(targetId: Buffer): Promise<Contact[]> {
    const closestNodes = this.routingTable.findClosest(targetId, ALPHA);
    const queriedNodes = new Set<string>([this.nodeId.toString('hex')]);

    const find = async (): Promise<void> => {
      const nodesToQuery = closestNodes.filter(
        (n) => !queriedNodes.has(n.nodeId.toString('hex')),
      );
      if (nodesToQuery.length === 0) {
        return; // No new nodes to query
      }

      // Mark as queried
      nodesToQuery.forEach((n) => queriedNodes.add(n.nodeId.toString('hex')));

      const promises: Promise<RpcMessage<{ contacts: Contact[] }>>[] =
        nodesToQuery.map((node) =>
          this.rpc.request({
            target: node,
            type: 'FIND_NODE_REQUEST',
            payload: {
              targetId: targetId.toString('hex'),
            },
          }),
        );

      const results = await Promise.allSettled(promises);
      let foundNewNodes = false;

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const response = result.value;
          const newContacts: Contact[] = response.payload.contacts.map((c) => ({
            ...c,
            nodeId: c.nodeId,
          }));

          newContacts.forEach((contact) => {
            this.routingTable.addContact(contact);
            const isNew = !closestNodes.some((n) =>
              n.nodeId.equals(contact.nodeId),
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
        return a.nodeId.compare(b.nodeId);
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
    await this.findNode(this.nodeId);
    log.info(`[${this.selfContact.port}] Bootstrap complete.`);
  }
}
