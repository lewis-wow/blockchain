import { describe, test, expect, beforeEach } from 'vitest';
import { Block } from '../../src/Block.js';
import { BlockChain, ReplaceChainResult } from '../../src/BlockChain.js';

describe('Blockchain', () => {
  let blockChain: BlockChain, blockChain2: BlockChain;

  beforeEach(() => {
    blockChain = new BlockChain();
    blockChain2 = new BlockChain();
  });

  test('starts with genesis block', () => {
    expect(blockChain.getChain()).toEqual([Block.genesis()]);
  });

  describe('addBlock()', () => {
    test('add block', () => {
      const data = {
        hello: 'world',
      };

      const genesis = Block.genesis();
      const newBlock = blockChain.addBlock(data);

      expect(blockChain.getChain()).toEqual([genesis, newBlock]);
    });
  });

  describe('isValidChain()', () => {
    test('validates a valid chain', () => {
      const data = {
        hello: 'world',
      };

      blockChain2.addBlock(data);

      expect(blockChain.isValidChain(blockChain2.getChain())).toBe(true);
    });

    test('invalidates corrupted genesis block data', () => {
      // @ts-expect-error - chain is a private property
      blockChain2.chain[0].data = {
        invalid: 'data',
      };

      expect(blockChain.isValidChain(blockChain2.getChain())).toBe(false);
    });

    test('invalidates corrupted genesis block hash', () => {
      const data = {
        hello: 'world',
      };

      blockChain2.addBlock(data);
      // @ts-expect-error - chain is a private property
      blockChain2.chain[0].hash = 'INVALID_HASH';

      expect(blockChain.isValidChain(blockChain2.getChain())).toBe(false);
    });

    test('invalidates corrupted block data', () => {
      const data = {
        hello: 'world',
      };

      blockChain2.addBlock(data);
      // @ts-expect-error - chain is a private property
      blockChain2.chain[1].data = {
        invalid: 'data',
      };

      expect(blockChain.isValidChain(blockChain2.getChain())).toBe(false);
    });

    test('invalidates corrupted block hash', () => {
      const data = {
        hello: 'world',
      };

      blockChain2.addBlock(data);
      // @ts-expect-error - chain is a private property
      blockChain2.chain[0].hash = 'INVALID_HASH';

      expect(blockChain.isValidChain(blockChain2.getChain())).toBe(false);
    });
  });

  describe('replaceChain()', () => {
    test('replaces the chain with longer valid chain', () => {
      const data = {
        hello: 'world',
      };

      blockChain2.addBlock(data);

      expect(blockChain.replaceChain(blockChain2.getChain())).toBe(
        ReplaceChainResult.NEW_CHAIN_REPLACE,
      );
    });

    test('not replace the chain with shorter valid chain', () => {
      const data = {
        hello: 'world',
      };

      blockChain.addBlock(data);

      expect(blockChain.replaceChain(blockChain2.getChain())).toBe(
        ReplaceChainResult.NEW_CHAIN_NO_LONGER,
      );
    });

    test('not replace the chain with equal lenght valid chain', () => {
      const data = {
        hello: 'world',
      };

      blockChain.addBlock(data);
      blockChain2.addBlock(data);

      expect(blockChain.replaceChain(blockChain2.getChain())).toBe(
        ReplaceChainResult.NEW_CHAIN_NO_LONGER,
      );
    });

    test('not replace the chain with invalid chain', () => {
      const data = {
        hello: 'world',
      };

      blockChain2.addBlock(data);
      // @ts-expect-error - chain is a private property
      blockChain2.chain[1].data = {
        invalid: 'data',
      };

      expect(blockChain.replaceChain(blockChain2.getChain())).toBe(
        ReplaceChainResult.NEW_CHAIN_INVALID,
      );
    });
  });
});
