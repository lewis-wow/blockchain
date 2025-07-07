import { describe, test, expect, beforeEach } from 'vitest';
import { Transaction } from '../../../src/cryptocurrency/Transaction.js';
import { Wallet } from '../../../src/cryptocurrency/Wallet.js';

describe('Transaction', () => {
  let senderWallet: Wallet, recipientWallet: Wallet;

  beforeEach(() => {
    senderWallet = new Wallet();
    recipientWallet = new Wallet();
  });

  describe('createTransaction()', () => {
    describe('amount is less than balance', () => {
      let transaction: Transaction;
      const amount = 100;

      beforeEach(() => {
        transaction = Transaction.createTransaction({
          senderWallet,
          recepientAddress: recipientWallet.publicKey,
          amount,
        });
      });

      test('`amount` is substracted from the wallet balance in outputs', () => {
        expect(
          transaction.outputs.find(
            (output) => output.address === senderWallet.publicKey,
          ).amount,
        ).toEqual(senderWallet.balance - amount);
      });

      test('`amount` is added to the recipient in outputs', () => {
        expect(
          transaction.outputs.find(
            (output) => output.address === recipientWallet.publicKey,
          ).amount,
        ).toEqual(amount);
      });

      test('`amount` is the balance of the sender wallet in input', () => {
        expect(transaction.input.amount).toEqual(senderWallet.balance);
      });
    });

    test('amount is more than balance', () => {
      expect(() =>
        Transaction.createTransaction({
          senderWallet,
          recepientAddress: recipientWallet.publicKey,
          amount: Wallet.INITIAL_BALANCE + 1,
        }),
      ).toThrowError();
    });
  });

  describe('verifyTransaction()', () => {
    let transaction: Transaction;
    const amount = 100;

    beforeEach(() => {
      transaction = Transaction.createTransaction({
        senderWallet,
        recepientAddress: recipientWallet.publicKey,
        amount,
      });
    });

    test('validates a valid transaction', () => {
      expect(Transaction.verifyTransaction(transaction)).toBe(true);
    });

    test('invalidates a corrupted transaction', () => {
      transaction.outputs[0] = {
        address: 'corrupted_address',
        amount,
      };

      expect(Transaction.verifyTransaction(transaction)).toBe(false);
    });
  });
});
