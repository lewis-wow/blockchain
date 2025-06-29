import { renderString } from 'prettyjson';
import { sha256 } from './sha256.js';
import { Serializable } from '../types.js';
import type { Merge } from 'type-fest';

/**
 * Options required to construct a Block.
 * @typedef {Object} BlockOptions
 * @property {Date} timestamp - The time the block was created.
 * @property {string} lastHash - The hash of the previous block.
 * @property {string} hash - The hash of the current block.
 * @property {Serializable} data - The data stored in the block (e.g., transactions).
 */
export type BlockOptions = {
  timestamp: Date;
  lastHash: string;
  hash: string;
  data: Serializable;
  nonce: number;
};

/**
 * Arguments used to generate a hash for a block.
 * @typedef {Object} HashArgs
 * @property {Date} timestamp - The time the block was created.
 * @property {string} lastHash - The hash of the previous block.
 * @property {Serializable} data - The block's payload.
 */
export type HashArgs = {
  timestamp: Date;
  lastHash: string;
  data: Serializable;
  nonce: number;
};

export type SerializedBlock = Merge<
  BlockOptions,
  {
    timestamp: string;
  }
>;

/**
 * Represents a block in a blockchain.
 */
export class Block {
  timestamp: Date;
  lastHash: string;
  hash: string;
  data: Serializable;
  nonce: number;

  /**
   * Creates an instance of Block.
   * @param {BlockOptions} opts - Configuration object for the block.
   */
  constructor(opts: BlockOptions) {
    this.timestamp = opts.timestamp;
    this.lastHash = opts.lastHash;
    this.hash = opts.hash;
    this.data = opts.data;
    this.nonce = opts.nonce;
  }

  /**
   * Converts the block to a JSON-friendly object.
   * @returns {object} JSON representation of the block.
   */
  toJSON(): SerializedBlock {
    return {
      timestamp: this.timestamp.toISOString(),
      lastHash: this.lastHash,
      hash: this.hash,
      data: this.data,
      nonce: this.nonce,
    };
  }

  static fromJSON(json: SerializedBlock): Block {
    return new Block({
      timestamp: new Date(json.timestamp),
      lastHash: json.lastHash,
      hash: json.hash,
      data: json.data,
      nonce: json.nonce,
    });
  }

  /**
   * Returns a pretty-printed string representation of the block.
   * @returns {string} Formatted string of the block.
   */
  toString(): string {
    return renderString(
      JSON.stringify({
        Block: this.toJSON(),
      }),
    );
  }

  /**
   * Creates and returns the genesis block (first block in the chain).
   * @returns {Block} The genesis block.
   */
  static genesis(): Block {
    const epoch = new Date(0);

    return new Block({
      timestamp: epoch,
      lastHash: sha256('genesis-last-hash'),
      hash: sha256('genesis-hash'),
      data: {},
      nonce: 0,
    });
  }

  /**
   * Generates a SHA-256 hash from block data.
   * @param {HashArgs} args - Data used to generate the hash.
   * @returns {string} SHA-256 hash.
   */
  static hash(args: HashArgs): string {
    return sha256(JSON.stringify(args));
  }

  /**
   * Creates a new block by mining it based on the previous block and new data.
   * @param {Block} lastBlock - The previous block in the chain.
   * @param {object} data - New data to include in the block.
   * @returns {Block} The newly mined block.
   */
  static mineBlock(lastBlock: Block, data: Serializable): Block {
    const lastHash = lastBlock.hash;

    let timestamp = new Date();
    let nonce = 0;

    let hash = Block.hash({
      timestamp,
      lastHash,
      data,
      nonce,
    });

    while (
      hash.substring(0, Block.DIFFICULTY) !== '0'.repeat(Block.DIFFICULTY)
    ) {
      timestamp = new Date();
      nonce++;

      hash = Block.hash({
        timestamp,
        lastHash,
        data,
        nonce,
      });
    }

    return new Block({
      timestamp,
      lastHash,
      hash,
      data,
      nonce,
    });
  }

  static blockHash(block: Block): string {
    const { timestamp, lastHash, data, nonce } = block;

    return Block.hash({ timestamp, lastHash, data, nonce });
  }

  static readonly DIFFICULTY = 6;
}
