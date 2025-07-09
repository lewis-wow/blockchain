import { Contract } from './Contract.js';

export type DhtFindNodeContractPayload = { id: string };

export const dhtFindNodeContract = new Contract({
  parse: (args: DhtFindNodeContractPayload): DhtFindNodeContractPayload => args,
  serialize: (args: DhtFindNodeContractPayload): DhtFindNodeContractPayload =>
    args,
  type: 'DHT_FIND_NODE',
});
