import { createLogger, transports } from 'winston';

export const log = createLogger({
  transports: [new transports.Console()],
});
