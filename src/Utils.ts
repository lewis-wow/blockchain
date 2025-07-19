import { createHash, randomBytes } from 'node:crypto';

import {
  createLogger as winstonCreateLogger,
  format,
  transports,
} from 'winston';
import { ID_BYTES, LOG_LEVEL } from './consts.js';
import util from 'util';
import { Contact } from './Contact.js';

// Destructure format functions from winston
const { combine, printf, colorize } = format;

/**
 * Custom log format function for Winston.
 * Formats log messages to include level, service name (if provided), message, and any extra arguments.
 */
const logFormat = printf(
  ({ level, message, serviceName, [Symbol.for('splat')]: splat }) => {
    // Determine the service label based on whether serviceName is provided
    const serviceLabel = serviceName ? `[${serviceName}]` : '';

    // Process extra arguments (splat) for logging.
    // If splat is an array, inspect each element for detailed logging.
    const extras = Array.isArray(splat)
      ? splat
          .map((val) => util.inspect(val, { depth: null, colors: true }))
          .join(' ')
      : '';

    // Construct the final log string
    return `${level} ${serviceLabel} ${message}${extras ? ' ' + extras : ''}`;
  },
);

/**
 * Utility class providing helper methods for various functionalities.
 */
export class Utils {
  /**
   * Generates a random Node ID.
   * The ID is created using cryptographically secure random bytes and converted to a hexadecimal string.
   * @returns {string} A hexadecimal string representing the generated Node ID.
   */
  static createNodeId(): string {
    return randomBytes(ID_BYTES).toString('hex');
  }

  /**
   * Computes the SHA256 hash of a given string.
   * @param {string} value - The input string to be hashed.
   * @returns {string} The SHA256 hash as a hexadecimal string.
   */
  static sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  static parseNetworkIdentifier(networkIdentifier: string): Contact | null {
    const bootstrapRegexMatch = networkIdentifier.match(
      Utils.BOOTSTRAP_SERVER_REGEX,
    );

    if (!bootstrapRegexMatch) {
      return null;
    }

    return Contact.fromJSON({
      nodeId: bootstrapRegexMatch[1],
      address: bootstrapRegexMatch[2],
      port: Number.parseInt(bootstrapRegexMatch[3]),
    });
  }

  /**
   * A default Winston logger instance configured with:
   * - `LOG_LEVEL` from constants.
   * - Colored output.
   * - Custom `logFormat`.
   * - Console transport for logging to the console.
   * @readonly
   */
  static readonly defaultLog = winstonCreateLogger({
    level: LOG_LEVEL, // Set the logging level (e.g., 'info', 'debug')
    format: combine(colorize(), logFormat), // Apply coloring and the custom log format
    transports: [new transports.Console()], // Log to the console
  });

  static readonly BOOTSTRAP_SERVER_REGEX = /^(.+)@(.+):(\d+)$/;
}
