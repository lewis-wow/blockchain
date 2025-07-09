import { JSONData } from '../types.js';
import { Contract } from './Contract.js';

export type DhtStoreContractPayload = {
  key: string;
  value: JSONData;
};

export const dhtStoreContract = new Contract({
  parse: (args: DhtStoreContractPayload): DhtStoreContractPayload => args,
  serialize: (args: DhtStoreContractPayload): DhtStoreContractPayload => args,
  type: 'DHT_STORE',
});
