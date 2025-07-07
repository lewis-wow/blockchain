import { createLogger, format, transports } from 'winston';

const { combine, printf, colorize } = format;

const logFormat = printf(({ level, message, serviceName, ...rest }) => {
  const serviceLabel = serviceName ? `[${serviceName}]` : '';
  const restData = Object.keys(rest).length ? JSON.stringify(rest) : '';
  return `${level} ${serviceLabel} ${message} ${restData}`;
});

export const log = createLogger({
  level: 'debug',
  format: combine(colorize(), logFormat),
  transports: [new transports.Console()],
});
