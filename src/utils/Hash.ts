import { createHash } from 'node:crypto';

export class Hash {
  /**
   * Computes the SHA256 hash of a given string.
   * @param {string} value - The input string to be hashed.
   * @returns {string} The SHA256 hash as a hexadecimal string.
   */
  static sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}
