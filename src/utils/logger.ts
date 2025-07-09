import { createLogger, format, transports } from 'winston';
import { LOG_LEVEL } from '../config.js';
import util from 'util';

const { combine, printf, colorize } = format;

const logFormat = printf(
  ({ level, message, serviceName, [Symbol.for('splat')]: splat }) => {
    const serviceLabel = serviceName ? `[${serviceName}]` : '';

    const extras = Array.isArray(splat)
      ? splat
          .map((val) => util.inspect(val, { depth: null, colors: true }))
          .join(' ')
      : '';

    return `${level} ${serviceLabel} ${message}${extras ? ' ' + extras : ''}`;
  },
);
export const log = createLogger({
  level: LOG_LEVEL,
  format: combine(colorize(), logFormat),
  transports: [new transports.Console()],
});
