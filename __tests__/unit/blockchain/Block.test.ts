import { describe, test, expect, beforeEach } from 'vitest';
import { Block } from '../../../src/blockchain/Block.js';

describe('Block', () => {
  let data: string, lastBlock: Block, block: Block;

  beforeEach(() => {
    data = 'foo';
    lastBlock = Block.genesis();
    block = Block.mineBlock(lastBlock, data);
  });

  test('`data` match input', () => {
    expect(block.data).toEqual(data);
  });

  test('`lastHash` match hash of last block', () => {
    expect(block.lastHash).toEqual(lastBlock.hash);
  });

  test('generates a hash that match difficulty', () => {
    expect(block.hash.substring(0, block.difficulty)).toEqual(
      '0'.repeat(block.difficulty),
    );
  });

  test('adjustDifficulty() decrease the difficulty for slowly mined block', () => {
    expect(
      Block.adjustDifficulty(
        lastBlock,
        new Date(lastBlock.timestamp.getTime() + Block.MINE_RATE + 1),
      ),
    ).toEqual(Block.DIFFICULTY - 1);
  });

  test('adjustDifficulty() increase the difficulty for slowly mined block', () => {
    expect(
      Block.adjustDifficulty(
        lastBlock,
        new Date(lastBlock.timestamp.getTime() + Block.MINE_RATE - 1),
      ),
    ).toEqual(Block.DIFFICULTY + 1);
  });
});
