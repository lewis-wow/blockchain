import {
  createPrivateKey,
  createPublicKey,
  createSign,
  createVerify,
  generateKeyPairSync,
} from 'node:crypto';
import { KEY_PAIR_SIGN_ALGORITHM } from '../consts.js';

/**
 * Defines the structure for initializing a KeyPair instance.
 */
export type KeyPairOptions = {
  publicKey: Buffer;
  privateKey: Buffer;
};

/**
 * Defines the arguments required for the `verifySignature` static method.
 */
export type VerifySignatureArgs = {
  publicKey: string;
  data: string;
  signature: string;
};

/**
 * The KeyPair class manages the creation, storage, and usage of
 * cryptographic public and private key pairs. It provides methods
 * for signing data and verifying signatures using these keys.
 */
export class KeyPair {
  /**
   * @private
   * Stores the public key component of the key pair as a Buffer.
   */
  private readonly publicKey: Buffer;
  /**
   * @private
   * Stores the private key component of the key pair as a Buffer.
   */
  private readonly privateKey: Buffer;

  /**
   * Constructs a new KeyPair instance.
   *
   * @param {KeyPairOptions} opts - An object containing the public and private key buffers.
   */
  constructor(opts: KeyPairOptions) {
    this.publicKey = opts.publicKey;
    this.privateKey = opts.privateKey;
  }

  /**
   * Signs a given piece of data using the instance's private key.
   * The signature is generated using the algorithm defined in `KEY_PAIR_SIGN_ALGORITHM`.
   *
   * @param {string} data - The data to be signed.
   * @returns {string} The digital signature in hexadecimal format.
   */
  sign(data: string): string {
    // Create a signer object with the specified signing algorithm.
    const signer = createSign(KEY_PAIR_SIGN_ALGORITHM);
    // Update the signer with the data to be signed.
    signer.update(data);
    // Finalize the data update for the signer.
    signer.end();

    // Convert the private key from hex string to DER format Buffer.
    const der = Buffer.from(this.getPrivateKey(), 'hex');

    // Create a private key object from the DER formatted private key.
    const keyObj = createPrivateKey({
      key: der,
      format: 'der',
      type: 'pkcs8', // PKCS#8 is a standard for storing private key information.
    });

    // Sign the data using the private key and return the signature in hexadecimal format.
    return signer.sign(keyObj, 'hex');
  }

  /**
   * Verifies a digital signature against a given piece of data and a public key.
   * This is a static method, meaning it can be called directly on the KeyPair class
   * without needing an instance of KeyPair.
   *
   * @param {object} args - An object containing the public key, original data, and signature.
   * @param {string} args.publicKey - The public key in hexadecimal format used to verify the signature.
   * @param {string} args.data - The original data that was signed.
   * @param {string} args.signature - The digital signature to be verified.
   * @returns {boolean} True if the signature is valid for the given data and public key, false otherwise.
   */
  static verifySignature({
    publicKey,
    data,
    signature,
  }: {
    publicKey: string;
    data: string;
    signature: string;
  }): boolean {
    // Create a verifier object with the specified signing algorithm.
    const verifier = createVerify(KEY_PAIR_SIGN_ALGORITHM);
    // Update the verifier with the data that was signed.
    verifier.update(data);
    // Finalize the data update for the verifier.
    verifier.end();

    // Convert the public key from hex string to DER format Buffer.
    const der = Buffer.from(publicKey, 'hex');

    // Create a public key object from the DER formatted public key.
    const keyObj = createPublicKey({
      key: der,
      format: 'der',
      type: 'spki', // SPKI (Subject Public Key Info) is a standard for public key information.
    });

    // Verify the signature using the public key and return the result.
    return verifier.verify(keyObj, signature, 'hex');
  }

  /**
   * Retrieves the public key of the instance in hexadecimal string format.
   *
   * @returns {string} The public key as a hexadecimal string.
   */
  getPublicKey(): string {
    return this.publicKey.toString('hex');
  }

  /**
   * Retrieves the private key of the instance in hexadecimal string format.
   *
   * @returns {string} The private key as a hexadecimal string.
   */
  getPrivateKey(): string {
    return this.privateKey.toString('hex');
  }

  /**
   * Generates a new cryptographic key pair (public and private keys)
   * using the Elliptic Curve Digital Signature Algorithm (ECDSA) with
   * the 'secp256k1' named curve.
   * The generated keys are encoded in DER format (SPKI for public, PKCS#8 for private).
   *
   * @returns {KeyPair} A new KeyPair instance containing the generated public and private keys.
   */
  static generateKeyPair(): KeyPair {
    // Generate an EC key pair synchronously.
    const { publicKey, privateKey } = generateKeyPairSync('ec', {
      namedCurve: 'secp256k1', // Specifies the elliptic curve to use. 'secp256k1' is commonly used in cryptocurrencies.
      publicKeyEncoding: {
        type: 'spki', // SubjectPublicKeyInfo format for the public key.
        format: 'der', // DER (Distinguished Encoding Rules) encoding.
      },
      privateKeyEncoding: {
        type: 'pkcs8', // PKCS#8 format for the private key.
        format: 'der', // DER encoding.
      },
    });

    // Return a new KeyPair instance with the generated keys.
    return new KeyPair({ publicKey, privateKey });
  }
}
