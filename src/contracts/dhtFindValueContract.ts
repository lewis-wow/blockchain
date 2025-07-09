import { Contract } from './Contract.js';

export type DhtFindValueContractPayload = {
  key: string;
};

export const dhtFindValueContract = new Contract({
  parse: (args: DhtFindValueContractPayload): DhtFindValueContractPayload =>
    args,
  serialize: (args: DhtFindValueContractPayload): DhtFindValueContractPayload =>
    args,
  type: 'DHT_FIND_VALUE',
});
