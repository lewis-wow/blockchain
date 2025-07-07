import { renderString } from 'prettyjson';
import { sha256 } from '../utils/sha256.js';
import { JSONData } from '../types.js';
import { Serializable } from '../utils/Serializable.js';

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
  data: JSONData;
  nonce: number;
  difficulty: number;
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
  data: JSONData;
  nonce: number;
  difficulty: number;
};

/**
 * Represents a block in a blockchain.
 */
export class Block extends Serializable {
  timestamp: Date;
  lastHash: string;
  hash: string;
  data: JSONData;
  nonce: number;
  difficulty: number;

  /**
   * Creates an instance of Block.
   * @param {BlockOptions} opts - Configuration object for the block.
   */
  constructor(opts: BlockOptions) {
    super();

    this.timestamp = opts.timestamp;
    this.lastHash = opts.lastHash;
    this.hash = opts.hash;
    this.data = opts.data;
    this.nonce = opts.nonce;
    this.difficulty = opts.difficulty;
  }

  /**
   * Converts the block to a JSON-friendly object.
   * @returns {object} JSON representation of the block.
   */
  toJSON(): Record<string, unknown> {
    return {
      timestamp: this.timestamp.toISOString(),
      lastHash: this.lastHash,
      hash: this.hash,
      data: this.data,
      nonce: this.nonce,
      difficulty: this.difficulty,
    };
  }

  static fromJSON(json: Record<string, unknown>): Block {
    return new Block({
      timestamp: new Date(json.timestamp as string),
      lastHash: json.lastHash as string,
      hash: json.hash as string,
      data: json.data as JSONData,
      nonce: json.nonce as number,
      difficulty: json.difficulty as number,
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
      difficulty: Block.DIFFICULTY,
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
  static mineBlock(lastBlock: Block, data: JSONData): Block {
    const lastHash = lastBlock.hash;
    let difficulty = lastBlock.difficulty;

    let timestamp = new Date();
    let nonce = 0;

    let hash = Block.hash({
      timestamp,
      lastHash,
      data,
      nonce,
      difficulty,
    });

    while (hash.substring(0, difficulty) !== '0'.repeat(difficulty)) {
      nonce++;
      timestamp = new Date();
      difficulty = Block.adjustDifficulty(lastBlock, timestamp);

      hash = Block.hash({
        timestamp,
        lastHash,
        data,
        nonce,
        difficulty,
      });
    }

    return new Block({
      timestamp,
      lastHash,
      hash,
      data,
      nonce,
      difficulty,
    });
  }

  static blockHash(block: Block): string {
    const { timestamp, lastHash, data, nonce, difficulty } = block;

    return Block.hash({ timestamp, lastHash, data, nonce, difficulty });
  }

  /**
   * Adjusts the mining difficulty based on the time taken to mine the last block.
   *
   * This function ensures that blocks are mined at a consistent rate, defined by `Block.MINE_RATE`,
   * regardless of the number of miners in the network. If the last block was mined too quickly,
   * the difficulty is increased. If it was mined too slowly, the difficulty is decreased.
   *
   * @param {Block} lastBlock - The last mined block.
   * @param {Date} currentTime - The current timestamp when a new block is being mined.
   * @returns {number} The adjusted difficulty for the new block.
   */
  static adjustDifficulty(lastBlock: Block, currentTime: Date): number {
    const { difficulty, timestamp } = lastBlock;

    if (timestamp.getTime() + Block.MINE_RATE > currentTime.getTime()) {
      return difficulty + 1;
    }

    return difficulty - 1;
  }

  /**
   * Initial genesis block difficulty
   */
  static readonly DIFFICULTY = 3;

  /**
   * Mine rate for adjusting dynamic difficulty for new block
   */
  static readonly MINE_RATE = 3000; // ms
}
