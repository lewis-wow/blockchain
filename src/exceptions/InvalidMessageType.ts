import { GenericException } from './GenericException.js';

export class InvalidMessageType extends GenericException {
  constructor() {
    super(`Message type is invalid.`);
  }
}
