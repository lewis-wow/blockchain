export class GenericException extends Error {
  name: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, GenericException.prototype);
  }
}
