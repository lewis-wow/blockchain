import { GenericException } from './GenericException.js';

/**
 * Represents an exception thrown when an attempted transaction amount exceeds the available balance.
 * This class extends `GenericException` for consistent error handling within the application.
 */
export class AmountExceedsBalance extends GenericException {
  /**
   * Creates an instance of `AmountExceedsBalance`.
   * @param amount - The specific amount that was attempted, which exceeded the balance.
   * This amount is included in the error message for clarity.
   */
  constructor(amount: number) {
    super(`Amount: ${amount} exceeds balance.`);
  }
}
