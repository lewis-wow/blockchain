import { match } from 'ts-pattern';
import { sha256 } from '../utils/sha256.js';
import { InvalidMessageType } from '../exceptions/InvalidMessageType.js';
import { xorDistance } from '../utils/xorDistance.js';
import { dhtStoreContract } from '../contracts/dhtStoreContract.js';
import { dhtFindValueContract } from '../contracts/dhtFindValueContract.js';
import { dhtFindNodeContract } from '../contracts/dhtFindNodeContract.js';
import { dhtHelloContract } from '../contracts/dhtHelloContract.js';
import { HandleMessageArgs, WebSocketServer } from './WebSocketServer.js';
import { WebSocket } from 'ws';
import { JSONData } from '../types.js';
import { dhtValueContract } from '../contracts/dhtValueContract.js';
import { dhtNodesContract } from '../contracts/dhtNodesContract.js';
import { log as defaultLog } from '../utils/logger.js';

const SERVICE_NAME = 'dht-server';
const log = defaultLog.child({ serviceName: SERVICE_NAME });

export type DhtServerOptions = {
  port: number;
};

export class DhtServer extends WebSocketServer {
  private store = new Map<string, JSONData>();

  // nodeId -> address
  private routingTable = new Map<string, string>();

  constructor(opts: DhtServerOptions) {
    super(opts);
  }

  get(key: string): JSONData | undefined {
    return this.store.get(key);
  }

  getRoutingTable(): Map<string, string> {
    return this.routingTable;
  }

  override listen(handler?: (server: this) => void): void {
    super.listen(handler);

    this.server.on('listening', () => {
      log.info(`DHT server running on ${this.address}`);
    });
  }

  override connectSocket(socket: WebSocket): void {
    super.connectSocket(socket);
  }

  override handleMessage({ payload, socket }: HandleMessageArgs): void {
    match(payload)
      .when(
        (shape) => dhtStoreContract.is(shape),
        ({ data }) => this.handleStore(data),
      )
      .when(
        (shape) => dhtFindValueContract.is(shape),
        ({ data }) => this.handleFindValue({ ...data, socket }),
      )
      .when(
        (shape) => dhtFindNodeContract.is(shape),
        ({ data }) =>
          this.handleFindNode({
            ...data,
            socket,
          }),
      )
      .when(
        (shape) => dhtHelloContract.is(shape),
        ({ data }) => this.handleHello(data),
      )
      .when(
        (shape) => dhtNodesContract.is(shape),
        ({ data }) => this.handleNodes(data),
      )
      .when(
        (shape) => dhtValueContract.is(shape),
        ({ data }) => this.handleValue(data),
      )
      .otherwise(() => {
        throw new InvalidMessageType();
      });
  }

  findClosestNodes(
    targetId: string,
    k = 3,
  ): {
    id: string;
    address: string;
  }[] {
    return [...this.routingTable.entries()]
      .map(([id, address]) => ({
        id,
        address,
        dist: xorDistance(id, targetId),
      }))
      .sort((a, b) => (a.dist < b.dist ? -1 : 1))
      .slice(0, k)
      .map((n) => ({ id: n.id, address: n.address }));
  }

  join(bootstrapAddress: string): void {
    this.sendMessage(
      bootstrapAddress,
      dhtFindNodeContract.stringify({ id: this.getId() }),
    );

    this.sendMessage(
      bootstrapAddress,
      dhtHelloContract.stringify({
        id: this.getId(),
        address: this.getAddress(),
      }),
    );
  }

  storeValue(key: string, value: JSONData): void {
    const keyId = sha256(key);
    const nodes = this.findClosestNodes(keyId);
    for (const node of nodes) {
      this.sendMessage(
        node.address,
        dhtStoreContract.stringify({ key, value }),
      );
    }
  }

  findValue(key: string): void {
    const keyId = sha256(key);
    const nodes = this.findClosestNodes(keyId);
    for (const node of nodes) {
      this.sendMessage(node.address, dhtFindValueContract.stringify({ key }));
    }
  }

  private handleStore(msg: { key: string; value: JSONData }): void {
    log.debug('handleStore()');
    this.store.set(msg.key, msg.value);
  }

  private handleFindValue(msg: { key: string; socket: WebSocket }): void {
    log.debug('handleFindValue()');
    const value = this.store.get(msg.key);
    this.sendMessage(
      msg.socket,
      dhtValueContract.stringify({ key: msg.key, value }),
    );
  }

  private handleValue(msg: { key: string; value: JSONData }): void {
    log.debug('handleValue()');
    console.log(msg);
  }

  private handleFindNode(msg: { id: string; socket: WebSocket }): void {
    log.debug('handleFindNode()');
    const nodes = this.findClosestNodes(msg.id);
    this.sendMessage(msg.socket, dhtNodesContract.stringify({ nodes }));
  }

  private handleNodes(msg: { nodes: { id: string; address: string }[] }): void {
    log.debug('handleNodes()');
    console.log(msg);
  }

  private handleHello(msg: { id: string; address: string }): void {
    this.routingTable.set(msg.id, msg.address);
    log.debug('handleHello()', this.routingTable);
  }
}
