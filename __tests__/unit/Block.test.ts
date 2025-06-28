import { describe, test, expect, beforeEach } from 'vitest';
import { Block } from '../../src/blockchain/Block.js';

describe('Block', () => {
  let data: object, lastBlock: Block, block: Block;

  beforeEach(() => {
    data = {
      hello: 'world',
    };

    lastBlock = Block.genesis();

    block = Block.mineBlock(lastBlock, data);
  });

  test('data match input', () => {
    expect(block.data).toBe(data);
  });

  test('lastHash match hash of last block', () => {
    expect(block.lastHash).toBe(lastBlock.hash);
  });
});
