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
  level: 'debug',
  format: combine(colorize(), timestamp(), logFormat),
  transports: [new transports.Console()],
});
