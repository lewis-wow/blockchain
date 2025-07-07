import { createSign, createVerify, generateKeyPairSync } from 'node:crypto';

export type KeyPairOptions = {
  publicKey: string;
  privateKey: string;
};

export type VerifySignatureArgs = {
  publicKey: string;
  data: string;
  signature: string;
};

export class KeyPair {
  private readonly publicKey: string;
  private readonly privateKey: string;

  constructor(opts: KeyPairOptions) {
    this.publicKey = opts.publicKey;
    this.privateKey = opts.privateKey;
  }

  sign(data: string): string {
    const signer = createSign(KeyPair.SIGN_ALGORITHM);
    signer.update(data);
    signer.end();

    return signer.sign(this.getPrivateKey(), 'hex');
  }

  static verifySignature({
    publicKey,
    data,
    signature,
  }: {
    publicKey: string;
    data: string;
    signature: string;
  }): boolean {
    const verifier = createVerify(KeyPair.SIGN_ALGORITHM);
    verifier.update(data);
    verifier.end();

    return verifier.verify(publicKey, signature, 'hex');
  }

  getPublicKey(): string {
    return this.publicKey;
  }

  getPrivateKey(): string {
    return this.privateKey;
  }

  static generateKeyPair(): KeyPair {
    const { publicKey, privateKey } = generateKeyPairSync('ec', {
      namedCurve: 'secp256k1',
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    return new KeyPair({ publicKey, privateKey });
  }

  static readonly SIGN_ALGORITHM = 'SHA256';
}
