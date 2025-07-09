import { JSONData } from '../types.js';
import { Contract } from './Contract.js';

export type DhtValueContractPayload = {
  key: string;
  value: JSONData;
};

export const dhtValueContract = new Contract({
  parse: (args: DhtValueContractPayload): DhtValueContractPayload => args,
  serialize: (args: DhtValueContractPayload): DhtValueContractPayload => args,
  type: 'DHT_VALUE',
});
