import EventEmitter from 'node:events';
import { Contact } from '../Contact.js';

export abstract class Server extends EventEmitter {
  constructor(protected selfContact: Contact) {
    super();
  }

  getSelfContact(): Contact {
    return this.selfContact;
  }

  getAddress(): string {
    return `//${this.selfContact.host}:${this.selfContact.port}`;
  }

  listen(): void {
    this.emit('listening');
  }
}
