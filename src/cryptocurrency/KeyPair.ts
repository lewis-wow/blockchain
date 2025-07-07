import { generateKeyPairSync } from 'node:crypto';

export type KeyPairOptions = {
  publicKey: string;
  privateKey: string;
};

export class KeyPair {
  private readonly publicKey: string;
  private readonly privateKey: string;

  constructor(opts: KeyPairOptions) {
    this.publicKey = opts.publicKey;
    this.privateKey = opts.privateKey;
  }

  getPublicKey(encoding?: BufferEncoding): string {
    return Buffer.from(this.publicKey, 'utf8').toString(encoding);
  }

  getPrivateKey(encoding?: BufferEncoding): string {
    return Buffer.from(this.privateKey, 'utf8').toString(encoding);
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
}
