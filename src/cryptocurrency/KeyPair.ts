import {
  createPrivateKey,
  createPublicKey,
  createSign,
  createVerify,
  generateKeyPairSync,
} from 'node:crypto';
import { KEY_PAIR_SIGN_ALGORITHM } from '../consts.js';

export type KeyPairOptions = {
  publicKey: Buffer;
  privateKey: Buffer;
};

export type VerifySignatureArgs = {
  publicKey: string;
  data: string;
  signature: string;
};

export class KeyPair {
  private readonly publicKey: Buffer;
  private readonly privateKey: Buffer;

  constructor(opts: KeyPairOptions) {
    this.publicKey = opts.publicKey;
    this.privateKey = opts.privateKey;
  }

  sign(data: string): string {
    const signer = createSign(KEY_PAIR_SIGN_ALGORITHM);
    signer.update(data);
    signer.end();

    const der = Buffer.from(this.getPrivateKey(), 'hex');

    const keyObj = createPrivateKey({
      key: der,
      format: 'der',
      type: 'pkcs8',
    });

    return signer.sign(keyObj, 'hex');
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
    const verifier = createVerify(KEY_PAIR_SIGN_ALGORITHM);
    verifier.update(data);
    verifier.end();

    const der = Buffer.from(publicKey, 'hex');

    const keyObj = createPublicKey({
      key: der,
      format: 'der',
      type: 'spki',
    });

    return verifier.verify(keyObj, signature, 'hex');
  }

  getPublicKey(): string {
    return this.publicKey.toString('hex');
  }

  getPrivateKey(): string {
    return this.privateKey.toString('hex');
  }

  static generateKeyPair(): KeyPair {
    const { publicKey, privateKey } = generateKeyPairSync('ec', {
      namedCurve: 'secp256k1',
      publicKeyEncoding: {
        type: 'spki',
        format: 'der',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'der',
      },
    });

    return new KeyPair({ publicKey, privateKey });
  }
}
