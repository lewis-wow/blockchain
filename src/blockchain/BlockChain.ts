import { first, isEqual, last } from 'lodash-es';
import { Block } from './Block.js';
import { log as defaultLog } from '../utils/logger.js';
import { Serializable } from '../utils/Serializable.js';
import { JSONData } from '../types.js';

const SERVICE_NAME = 'blockchain';
const log = defaultLog.child({ serviceName: SERVICE_NAME });

export enum ReplaceChainResult {
  NEW_CHAIN_REPLACE = 'NEW_CHAIN_REPLACE',
  NEW_CHAIN_NO_LONGER = 'NEW_CHAIN_NO_LONGER',
  NEW_CHAIN_INVALID = 'NEW_CHAIN_INVALID',
}

/**
 * Represents a simple blockchain composed of linked blocks.
 */
export class BlockChain extends Serializable {
  /**
   * The internal chain of blocks. Initialized with the genesis block.
   * @private
   * @type {Block[]}
   */
  constructor(private chain: Block[] = [Block.genesis()]) {
    super();
  }

  /**
   * Adds a new block to the chain with the given data.
   * @param {JSONData} data - The data to be included in the new block.
   * @returns {Block} The newly added block.
   */
  addBlock(data: JSONData): Block {
    const lastBlock = last(this.chain)!;
    const block = Block.mineBlock(lastBlock, data);
    this.chain.push(block);

    return block;
  }

  /**
   * Retrieves the current chain of blocks.
   * @returns {Block[]} The blockchain as an array of blocks.
   */
  getChain(): Block[] {
    return this.chain;
  }

  /**
   * Validates incomming chains
   * @param {Block[]} chain - The incomming chain
   * @returns {boolean} true if the incomming chain is valid against this chain
   */
  isValidChain(chain: Block[]): boolean {
    const chainGenesisBlock = first(chain);
    const thisGenesisBlock = first(this.chain);

    if (!isEqual(chainGenesisBlock, thisGenesisBlock)) {
      return false;
    }

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const lastBlock = chain[i - 1];

      if (
        /**
         * Check if current block has correct reference to last block
         */
        block.lastHash !== lastBlock.hash ||
        /**
         * Check if block hash is the same if we do the hash from the data again
         * We need this to validate if the block hash is correct and not changed
         */
        block.hash !== Block.blockHash(block)
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Resolves fork problem, when network creates 2 blocks at the same time
   * When new chain is valid and longer than current chain, then we replace the current chain with new one
   *
   * @param {Block[]} newChain - chain that can replace current chain
   * @returns {boolean} true if the new chain is accepted
   */
  replaceChain(newChain: Block[]): ReplaceChainResult {
    if (newChain.length <= this.chain.length) {
      return ReplaceChainResult.NEW_CHAIN_NO_LONGER;
    }

    if (!this.isValidChain(newChain)) {
      return ReplaceChainResult.NEW_CHAIN_INVALID;
    }

    log.debug('Replacing blockchain with new one', newChain);
    this.chain = newChain;
    return ReplaceChainResult.NEW_CHAIN_REPLACE;
  }

  toJSON(): Record<string, unknown>[] {
    return this.getChain().map((block) => block.toJSON());
  }

  static fromJSON(json: Record<string, unknown>[]): BlockChain {
    return new BlockChain(
      json.map((serializedBlock) => Block.fromJSON(serializedBlock)),
    );
  }
}
