import { GenericException } from './GenericException.js';

export class InvalidTransaction extends GenericException {
  constructor(address: string) {
    super(`Transaction: invalid transaction from ${address}.`);
  }
}
