import { createHash } from 'node:crypto';

/**
 * Generates a SHA-256 hash of a given string value.
 *
 * @param {string} value - The input string to hash.
 * @returns {string} The resulting SHA-256 hash in hexadecimal format.
 */
export const sha256 = (value: string): string => {
  return createHash('sha256').update(value).digest('hex');
};
