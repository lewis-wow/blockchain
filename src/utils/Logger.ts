import {
  createLogger as winstonCreateLogger,
  Logger as WinstonLogger,
  format,
  transports,
} from 'winston';
import { LOG_LEVEL } from '../consts.js';
import { inspect } from 'util';

export type LoggerOptions = {
  serviceName: string;
};

export class Logger {
  private readonly serviceName: string;
  private readonly logger: WinstonLogger;

  constructor(opts: LoggerOptions) {
    this.serviceName = opts.serviceName;
    this.logger = logger.child({ serviceName: this.serviceName });
  }

  info(message: string, data?: object): void {
    this.logger.info(message, data);
  }

  error(message: string, data?: object): void {
    this.logger.error(message, data);
  }

  exception(message: string, exception: Error): void {
    this.logger.error(message, exception);
  }

  debug(message: string, data?: object): void {
    this.logger.debug(message, data);
  }

  warn(message: string, data?: object): void {
    this.logger.warn(message, data);
  }

  log(message: string, data?: object): void {
    this.logger.log(message, data);
  }

  static getBaseWinstonLogger(): WinstonLogger {
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
              .map((val) => inspect(val, { depth: null, colors: true }))
              .join(' ')
          : '';

        // Construct the final log string
        return `${level} ${serviceLabel} ${message}${extras ? ' ' + extras : ''}`;
      },
    );

    const logger = winstonCreateLogger({
      level: LOG_LEVEL, // Set the logging level (e.g., 'info', 'debug')
      format: combine(colorize(), logFormat), // Apply coloring and the custom log format
      transports: [new transports.Console()], // Log to the console
    });

    return logger;
  }
}
