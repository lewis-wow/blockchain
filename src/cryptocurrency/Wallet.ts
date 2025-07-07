import { renderString } from 'prettyjson';
import { KeyPair } from './KeyPair.js';

export class Wallet {
  balance: number;
  keyPair: KeyPair;
  publicKey: string;

  constructor() {
    this.balance = Wallet.INITIAL_BALANCE;
    this.keyPair = KeyPair.generateKeyPair();
    this.publicKey = this.keyPair.getPublicKey('hex');
  }

  toJSON(): Record<string, unknown> {
    return {
      balance: this.balance,
      publicKey: this.publicKey,
    };
  }

  toString(): string {
    return renderString(
      JSON.stringify({
        Block: this.toJSON(),
      }),
    );
  }

  static readonly INITIAL_BALANCE = 500;
}
