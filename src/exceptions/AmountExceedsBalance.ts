import { GenericException } from './GenericException.js';

export class AmountExceedsBalance extends GenericException {
  constructor(amount: number) {
    super(`Amount: ${amount} exceeds balance.`);
  }
}
