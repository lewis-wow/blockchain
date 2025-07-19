import { GenericException } from './GenericException.js';

/**
 * Represents an exception specifically thrown when an invalid transaction is encountered.
 * This class extends `GenericException`, providing a more specific error type for transaction-related issues.
 */
export class InvalidTransaction extends GenericException {
  /**
   * Creates an instance of `InvalidTransaction`.
   * @param address - The address from which the invalid transaction originated.
   * This is included in the error message for better context.
   */
  constructor(address: string) {
    super(`Transaction: invalid transaction from ${address}.`);
  }
}
