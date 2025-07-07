import { BlockChain } from '../blockchain/BlockChain.js';
import { JSONObject } from '../types.js';
import { Message } from './Message.js';

export class ChainMessage extends Message {
  static fromJSON(data: JSONObject[]): BlockChain {
    return BlockChain.fromJSON(data);
  }

  static toJSON(blockChain: BlockChain): JSONObject[] {
    return blockChain.getChain().map((block) => block.toJSON());
  }

  static readonly MESSAGE_TYPE = 'CHAIN';
}
