import { match } from 'ts-pattern';
import { HOSTNAME } from '../config.js';
import { sha256 } from '../utils/sha256.js';
import { WebSocketServerHandler } from './WebSocketServerHandler.js';
import { InvalidMessageType } from '../exceptions/InvalidMessageType.js';
import { xorDistance } from '../utils/xorDistance.js';
import { Contract } from '../contracts/Contract.js';
import { dhtStoreContract } from '../contracts/dhtStoreContract.js';
import { dhtFindValueContract } from '../contracts/dhtFindValueContract.js';
import { dhtFindNodeContract } from '../contracts/dhtFindNodeContract.js';
import { dhtHelloContract } from '../contracts/dhtHelloContract.js';

export type DhtServerOptions = {
  port: number;
};

export class DhtServer extends WebSocketServerHandler {
  private address: string;
  private id: string;
  private store = new Map<string, unknown>();

  // nodeId -> address
  private routingTable = new Map<string, string>();

  constructor(opts: DhtServerOptions) {
    super();

    this.address = `ws://${HOSTNAME}:${opts.port}`;
    this.id = sha256(this.address);
  }

  override handleMessage(payloadData: typeof Contract.$BASE_ENVELOP): void {
    match(payloadData)
      .when(dhtStoreContract.is, () => this.handleStore())
      .when(dhtFindValueContract.is, () => this.handleFindValue())
      .when(dhtFindNodeContract.is, () => this.handleFindNode())
      .when(dhtHelloContract.is, () => this.handleHello())
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
    this.sendMessage(bootstrapAddress, { type: 'FIND_NODE', target: this.id });
    this.sendMessage(bootstrapAddress, {
      type: 'HELLO',
      id: this.id,
      address: this.address,
    });
  }

  storeValue(key: string, value: unknown): void {
    const keyId = sha256(key);
    const nodes = this.findClosestNodes(keyId);
    for (const node of nodes) {
      this.sendMessage(node.address, {
        type: 'STORE',
        key,
        value,
      });
    }
  }

  findValue(key: string) {
    const keyId = sha256(key);
    const nodes = this.findClosestNodes(keyId);
    for (const node of nodes) {
      this.sendMessage(node.address, {
        type: 'FIND_VALUE',
        key,
      });
    }
  }

  private sendMessage(address: string, message: unknown): void {
    connectToPeer(
      address,
      (ws) => ws.send(JSON.stringify(message)),
      () => {},
    );
  }

  private handleStore(): void {}

  private handleFindValue(): void {}

  private handleFindNode(): void {}

  private handleHello(): void {}
}
