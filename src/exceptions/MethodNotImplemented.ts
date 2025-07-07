import { GenericException } from './GenericException.js';

export class MethodNotImplemented extends GenericException {
  constructor() {
    super(`Method not implemented.`);
  }
}
