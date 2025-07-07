import { describe, test, expect, beforeEach } from 'vitest';
import { Wallet } from '../../../src/cryptocurrency/Wallet.js';

describe('Wallet', () => {
  let wallet: Wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  test('`balance` match `Wallet.INITIAL_BALANCE`', () => {
    expect(wallet.balance).toEqual(Wallet.INITIAL_BALANCE);
  });
});
