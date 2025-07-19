/**
 * A base custom exception class that extends the built-in `Error` class.
 * This class is designed to be a generic exception that can be extended
 * by more specific exception types within the application.
 */
export class GenericException extends Error {
  /**
   * Overrides the default `name` property of the `Error` class.
   * This ensures that the `name` of the exception instance will be
   * the actual class name (e.g., "GenericException" or the name of a subclass).
   * @readonly
   */
  override readonly name: string;

  /**
   * Creates an instance of `GenericException`.
   * @param message - A human-readable description of the error.
   */
  constructor(message: string) {
    super(message);

    // Set the `name` property to the name of the constructor function.
    // This makes `error.name` reflect the class name (e.g., 'GenericException').
    this.name = this.constructor.name;

    // Correctly sets the prototype chain for instances of this class.
    // This is crucial for `instanceof` checks to work correctly when
    // extending built-in classes like `Error` in environments that
    // don't fully support `new.target` or `Reflect.setPrototypeOf`.
    Object.setPrototypeOf(this, GenericException.prototype);
  }
}
