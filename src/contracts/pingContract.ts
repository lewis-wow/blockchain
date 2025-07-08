import { Contract } from './Contract.js';

export const pingContract = new Contract({
  parse: () => undefined,
  serialize: () => undefined,
  type: 'PING',
});
