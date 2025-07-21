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
