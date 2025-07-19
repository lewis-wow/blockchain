import { createHash, randomBytes } from 'node:crypto';

import {
  createLogger as winstonCreateLogger,
  format,
  transports,
} from 'winston';
import { HOSTNAME, ID_BYTES, LOG_LEVEL } from './consts.js';
import util from 'util';
import { Contact } from './Contact.js';

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

export class Utils {
  static createNodeId(): string {
    return randomBytes(ID_BYTES).toString('hex');
  }

  static sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  static createNodeSelfContacts(args: {
    apiServerPort: number;
    p2pServerPort: number;
    kademliaServerPort: number;
  }): {
    nodeId: string;
    apiServerSelfContact: Contact;
    p2pServerSelfContact: Contact;
    kademliaServerSelfContact: Contact;
  } {
    const nodeId = Utils.createNodeId();

    return {
      nodeId,
      apiServerSelfContact: new Contact({
        host: HOSTNAME,
        port: args.apiServerPort,
        nodeId,
      }),
      p2pServerSelfContact: new Contact({
        host: HOSTNAME,
        port: args.p2pServerPort,
        nodeId,
      }),
      kademliaServerSelfContact: new Contact({
        host: HOSTNAME,
        port: args.kademliaServerPort,
        nodeId,
      }),
    };
  }

  static readonly defaultLog = winstonCreateLogger({
    level: LOG_LEVEL,
    format: combine(colorize(), logFormat),
    transports: [new transports.Console()],
  });
}
