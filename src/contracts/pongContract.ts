import { Contract } from './Contract.js';

export const pongContract = new Contract({
  parse: () => undefined,
  serialize: () => undefined,
  type: 'PONG',
});
