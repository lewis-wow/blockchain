import { BlockChain } from '../blockchain/BlockChain.js';
import { Message } from './Message.js';

export class ChainMessage extends Message {
  static create(data: Record<string, unknown>[]): BlockChain {
    return BlockChain.fromJSON(data);
  }

  static serialize(blockChain: BlockChain): string {
    return super.stringify(
      ChainMessage.MESSAGE_TYPE,
      blockChain.getChain().map((block) => block.toJSON()),
    );
  }

  static readonly MESSAGE_TYPE = 'CHAIN';
}
