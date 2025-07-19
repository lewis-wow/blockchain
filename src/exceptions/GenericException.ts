export class GenericException extends Error {
  override readonly name: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, GenericException.prototype);
  }
}
