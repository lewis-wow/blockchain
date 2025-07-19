// src/Node.ts

import { RoutingTable } from './RoutingTable.js';
import { RpcServer } from '../rpc/RpcServer.js';
import { ALPHA } from '../consts.js';
import { Utils } from '../Utils.js';
import { Contact } from '../Contact.js';
import { RpcMessage } from '../RpcMessage.js';
import { JSONObject } from '../types.js';
import { NetworkListenableNode } from '../network_node/NetworkListenableNode.js';

const SERVICE_NAME = 'kademlia-server';
const log = Utils.defaultLog.child({ serviceName: SERVICE_NAME });

/**
 * Represents a Kademlia node in the network.
 */
export class KademliaServer extends NetworkListenableNode {
  public readonly routingTable: RoutingTable;
  private readonly rpc: RpcServer;

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
        const targetId = message.payload.targetId;
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

      const promises: Promise<RpcMessage<{ contacts: JSONObject[] }>>[] =
        nodesToQuery.map((node) =>
          this.rpc.request({
            target: node,
            type: 'FIND_NODE_REQUEST',
            payload: {
              targetId: targetId,
            },
          }),
        );

      const results = await Promise.allSettled(promises);
      let foundNewNodes = false;

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          const response = result.value;
          const newContacts: Contact[] = response.payload.contacts.map(
            (contact) => Contact.fromJSON(contact),
          );

          newContacts.forEach((contact) => {
            console.log('foreach');
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
    console.log('bootstrap');
    this.routingTable.addContact(bootstrapContact);
    // Discover other nodes by performing a lookup for our own ID
    await this.findNode(this.selfContact.nodeId);
    log.info(`[${this.selfContact.port}] Bootstrap complete.`);
  }
}
