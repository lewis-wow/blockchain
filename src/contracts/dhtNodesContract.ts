import { Contract } from './Contract.js';

export type DhtNodesContractPayload = {
  nodes: { id: string; address: string }[];
};

export const dhtNodesContract = new Contract({
  parse: (args: DhtNodesContractPayload): DhtNodesContractPayload => args,
  serialize: (args: DhtNodesContractPayload): DhtNodesContractPayload => args,
  type: 'DHT_NODES',
});
