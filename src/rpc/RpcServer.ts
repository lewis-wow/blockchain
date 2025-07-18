import { createSocket, RemoteInfo, Socket } from 'dgram';
import { Contact } from '../Contact.js';
import { NetworkListenableNode } from '../network_node/NetworkListenableNode.js';
import { JSONRPCClient, JSONRPCServer } from 'json-rpc-2.0';
import { RpcParams } from './RpcParams.js';
import { MaybePromise } from '../types.js';

/**
 * Defines the parameters expected by the JSON-RPC client's transport layer.
 * @property rinfo - Remote information including port and address for sending messages.
 */
export type JSONRPCClientParams = {
  rinfo: Pick<RemoteInfo, 'port' | 'address'>;
};

export type RpcServerEventMap = {
  seen: (contact: Contact) => void;
  listening: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RpcServerProcedureMap = Record<string, (args: any) => any>;

type ConditionalData<
  T extends RpcServerProcedureMap,
  K extends keyof T,
> = Parameters<T[K]>[0] extends undefined
  ? { data?: Parameters<T[K]>[0] } // If it can be undefined, make 'data' optional
  : { data: Parameters<T[K]>[0] }; // Otherwise, 'data' is required

/**
 * RpcServer handles sending and receiving RPC messages over UDP.
 * It extends `NetworkListenableNode` to enable network listening capabilities.
 */
export class RpcServer<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  T extends RpcServerProcedureMap = {},
> extends NetworkListenableNode<RpcServerEventMap> {
  /**
   * The UDP socket used for communication.
   * @private
   */
  private readonly socket: Socket;

  /**
   * The JSON-RPC server instance for handling incoming RPC requests.
   * @private
   */
  private readonly jsonRpcServer = new JSONRPCServer();

  /**
   * The JSON-RPC client instance for making outgoing RPC requests.
   * It uses the UDP socket to send messages to the specified remote info.
   * @private
   */
  private readonly jsonRpcClient = new JSONRPCClient<JSONRPCClientParams>(
    (payload, { rinfo }) => {
      console.log('socket send', payload, rinfo);
      // Sends the JSON-RPC payload as a UDP message to the target rinfo.
      this.socket.send(JSON.stringify(payload), rinfo.port, rinfo.address);
    },
  );

  /**
   * Constructs an instance of RpcServer.
   * @param selfContact - The contact information for this network node.
   */
  constructor(selfContact: Contact) {
    super(selfContact); // Call the parent constructor to initialize selfContact
    this.socket = createSocket('udp4'); // Create a UDP4 socket

    // Apply middleware to the JSON-RPC server to process incoming requests.
    this.jsonRpcServer.applyMiddleware(async (next, request, serverParams) => {
      // Parse the RPC parameters from the request.
      const parsedRpcParams = RpcParams.fromJSON(request.params);
      // Emit a 'seen' event with the contact information from the parsed parameters.
      this.emit('seen', parsedRpcParams.contact);

      console.log(request);

      // Continue to the next middleware or the actual RPC method handler.
      return await next(request, serverParams);
    });

    // Set up the event listeners for the UDP socket.
    this.setupListeners();
  }

  /**
   * Sets up event listeners for the UDP socket.
   * Listens for 'message' (incoming UDP packets) and 'listening' events.
   * @private
   */
  private setupListeners(): void {
    // Handler for incoming UDP messages.
    this.socket.on('message', async (msg, rinfo) => {
      // Process the incoming message using the JSON-RPC server.
      const response = await this.jsonRpcServer.receiveJSON(msg.toString());

      console.log({ response });

      if (response) {
        this.socket.send(JSON.stringify(response), rinfo.port, rinfo.address);
      }
    });

    // Handler for the 'listening' event, emitted when the socket starts listening.
    this.socket.on('listening', () => {
      this.emit('listening');
    });
  }

  /**
   * Implements the abstract `listen` method from `NetworkListenableNode`.
   * Binds the UDP socket to the host and port specified in the `selfContact`.
   * @override
   */
  public override listen(): void {
    this.socket.bind(this.selfContact.port, this.selfContact.address); // Bind to the specified port and host
  }

  public addMethod<K extends keyof T>(args: {
    method: K;
    handler: (
      params: RpcParams<Parameters<T[K]>[0]>,
    ) => MaybePromise<ReturnType<T[K]>>;
  }): void {
    this.jsonRpcServer.addMethod(args.method as string, async (params) => {
      console.log('handle init');
      const response = await args.handler(RpcParams.fromJSON(params));
      console.log('resp', response);
      return response;
    });
  }

  /**
   * Sends an RPC request to a target contact.
   * @param args - An object containing the method name, target contact, and optional data.
   * @param args.method - The name of the RPC method to call.
   * @param args.contact - The `Contact` object of the remote node to send the request to.
   * @param args.data - Optional JSON data to include in the RPC request parameters.
   * @returns {Promise<RpcParams>} A promise that resolves with the `RpcParams` received in the response.
   */
  public async request<K extends keyof T>(
    args: {
      method: K;
      contact: Contact;
    } & ConditionalData<T, K>,
  ): Promise<RpcParams<ReturnType<T[K]>>> {
    console.log('init');

    const params = new RpcParams({
      contact: this.selfContact, // Include this node's contact info
      data: args.data as Parameters<T[K]>[0], // Include any additional data
    });

    // Send an RPC request using the JSON-RPC client.
    const payload = await this.jsonRpcClient.request(
      args.method as string,
      params.toJSON(), // Convert RpcParams to JSON for the request payload
      {
        rinfo: args.contact, // Provide remote info for the client's transport layer
      },
    );

    console.log(payload);

    // Convert the received payload back into RpcParams and return.
    return RpcParams.fromJSON(payload);
  }

  public notify<K extends keyof T>(
    args: {
      method: K;
      contact: Contact;
    } & ConditionalData<T, K>,
  ): void {
    const params = new RpcParams({
      contact: this.selfContact, // Include this node's contact info
      data: args.data as Parameters<T[K]>[0], // Include any additional data
    });

    // Send an RPC request using the JSON-RPC client.
    this.jsonRpcClient.notify(
      args.method as string,
      params.toJSON(), // Convert RpcParams to JSON for the request payload
      {
        rinfo: args.contact, // Provide remote info for the client's transport layer
      },
    );
  }

  async broadcastRequest<K extends keyof T>(
    args: {
      method: K;
      contacts: Contact[];
    } & ConditionalData<T, K>,
  ): Promise<RpcParams<ReturnType<T[K]>>[]> {
    return await Promise.all(
      args.contacts.map((contact) =>
        this.request<K>({
          method: args.method,
          data: args.data,
          contact,
        }),
      ),
    );
  }

  broadcastNotify<K extends keyof T>(
    args: {
      method: K;
      contacts: Contact[];
    } & ConditionalData<T, K>,
  ): void {
    args.contacts.forEach((contact) =>
      this.notify<K>({
        method: args.method,
        data: args.data,
        contact,
      }),
    );
  }
}
