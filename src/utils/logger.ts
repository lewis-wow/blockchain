import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(
  ({ level, message, timestamp, serviceName, ...rest }) => {
    const serviceLabel = serviceName ? `[${serviceName}]` : '';
    const restData = Object.keys(rest).length ? JSON.stringify(rest) : '';
    return `${timestamp} ${level} ${serviceLabel} ${message} ${restData}`;
  },
);

export const log = createLogger({
  format: combine(
    colorize(), // Add colors
    timestamp(), // Add timestamp
    logFormat, // Use custom format
  ),
  transports: [new transports.Console()],
});
