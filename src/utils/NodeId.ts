import { KeyPair } from './KeyPair.js';

/**
 * NodeId class represents a unique identifier for a node in a decentralized system.
 * It manages the node's cryptographic key pair, which is used for
 * identification, signing data, and verifying signatures.
 */
export class NodeId {
  /**
   * @private
   * Stores the cryptographic key pair (public and private keys) for the node.
   * The key pair is generated when a new NodeId instance is created.
   */
  private readonly keyPair = KeyPair.generateKeyPair();

  /**
   * Retrieves the public key of the node, which serves as its unique identifier.
   *
   * @returns {string} The public key of the node.
   */
  getNodeId(): string {
    return this.keyPair.getPublicKey();
  }

  /**
   * Signs a given piece of data using the node's private key.
   * This creates a digital signature that can be verified by anyone with the node's public key,
   * ensuring the data's authenticity and integrity.
   *
   * @param {string} data The data to be signed.
   * @returns {string} The digital signature of the data.
   */
  sign(data: string): string {
    return this.keyPair.sign(data);
  }

  /**
   * Verifies a digital signature against a given piece of data and the node's public key.
   * This method is used to check if a signature is valid and if the data has not been tampered with.
   *
   * @param {object} params - The parameters for signature verification.
   * @param {string} params.data - The original data that was signed.
   * @param {string} params.signature - The digital signature to be verified.
   * @returns {boolean} True if the signature is valid for the given data and public key, false otherwise.
   */
  verifySignature({
    data,
    signature,
  }: {
    data: string;
    signature: string;
  }): boolean {
    return KeyPair.verifySignature({
      publicKey: this.keyPair.getPublicKey(),
      data,
      signature,
    });
  }
}
