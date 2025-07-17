// src/RPC.ts

import { createSocket, Socket } from 'dgram';
import { randomBytes } from 'crypto';
import { Server, Contact } from './Server.js';
import { KademliaServer } from '../kademlia/KademliaServer.js';
import { Utils } from '../Utils.js';

export type RpcMessage<TPayload = unknown> = {
  type: string;
  payload: TPayload;
  sender: Contact;
  rpcId: string;
};

const SERVICE_NAME = 'rpc-server';
const log = Utils.defaultLog.child({ serviceName: SERVICE_NAME });

/**
 * Handles sending and receiving RPC messages over UDP.
 */
export class RpcServer extends Server {
  private readonly socket: Socket;
  private readonly pendingRequests: Map<
    string,
    (response: RpcMessage) => void
  > = new Map();

  constructor(selfContact: Contact) {
    super(selfContact); // Call the parent constructor
    this.socket = createSocket('udp4');
    this.setupListeners();
  }

  private setupListeners(): void {
    this.socket.on('message', (msg) => {
      try {
        const message: RpcMessage = JSON.parse(msg.toString());

        // When we hear from a node, we update our routing table.
        // The sender's contact info is in the message itself.
        this.emit('seen', message.sender);

        if (message.type.endsWith('_RESPONSE')) {
          const callback = this.pendingRequests.get(message.rpcId);
          if (callback) {
            callback(message);
            this.pendingRequests.delete(message.rpcId);
          }
        } else {
          // This is a request, so we emit it for the Node to handle.
          this.emit(message.type, message);
        }
      } catch (error) {
        console.error('Failed to parse RPC message:', error);
      }
    });

    this.socket.on('listening', () => {
      const address = this.socket.address();
      log.debug(`RPC server listening on ${address.address}:${address.port}`);
    });
  }

  /**
   * Implements the abstract listen method from the Server class.
   * Binds the UDP socket to the host and port from the selfContact.
   */
  public override listen(): void {
    this.socket.bind(this.selfContact.port, this.selfContact.host);
    super.listen();
  }

  /**
   * Sends an RPC request and returns a promise that resolves with the response.
   * @param target The contact to send the request to.
   * @param type The type of the RPC request.
   * @param payload The data to send with the request.
   * @returns A promise that resolves with the response message.
   */
  public request(args: {
    target: Contact;
    type: string;
    payload?: unknown;
    timeout?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): Promise<RpcMessage<any>> {
    const { target, type, payload, timeout } = args;

    return new Promise((resolve, reject) => {
      const rpcId = randomBytes(16).toString('hex');
      const message: RpcMessage = {
        type,
        rpcId,
        sender: this.selfContact,
        payload,
      };

      this.pendingRequests.set(rpcId, resolve);

      const buffer = Buffer.from(JSON.stringify(message));
      this.socket.send(buffer, target.port, target.host, (err) => {
        if (err) {
          this.pendingRequests.delete(rpcId);
          reject(err);
        }
      });

      if (timeout !== undefined) {
        // Set a timeout for the request
        setTimeout(() => {
          if (this.pendingRequests.has(rpcId)) {
            this.pendingRequests.delete(rpcId);
            reject(
              new Error(
                `RPC request ${rpcId} to ${target.host}:${target.port} timed out`,
              ),
            );
          }
        }, timeout);
      }
    });
  }

  /**
   * Sends a response to a request.
   * @param target The contact to send the response to.
   * @param message The original request message.
   * @param type The type of the response.
   * @param payload The data for the response.
   */
  public respond(args: {
    target: Contact;
    message: RpcMessage;
    type: string;
    payload: unknown;
  }): void {
    const { target, message, type, payload } = args;
    const response: RpcMessage = {
      type,
      rpcId: message.rpcId, // Echo the rpcId from the request
      sender: this.selfContact,
      payload,
    };
    const buffer = Buffer.from(JSON.stringify(response));
    this.socket.send(buffer, target.port, target.host);
  }

  async broadcast(
    kademlia: KademliaServer,
    request: (contact: Contact) => Promise<RpcMessage<unknown>>,
  ): Promise<RpcMessage<unknown>[]> {
    const contacts = kademlia.routingTable.getAllContacts();

    return await Promise.all(
      contacts.map((contact) =>
        request(contact).catch((error) => {
          log.warn(
            `Failed to broadcast clear signal to ${contact.host}:${contact.port}`,
            error,
          );

          return error;
        }),
      ),
    );
  }
}
