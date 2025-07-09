import { Contract } from './Contract.js';

export type DhtHelloContractPayload = { id: string; address: string };

export const dhtHelloContract = new Contract({
  parse: (args: DhtHelloContractPayload): DhtHelloContractPayload => args,
  serialize: (args: DhtHelloContractPayload): DhtHelloContractPayload => args,
  type: 'DHT_HELLO',
});
