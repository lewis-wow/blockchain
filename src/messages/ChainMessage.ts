import { BlockChain } from '../blockchain/BlockChain.js';
import { Message } from './Message.js';

export class ChainMessage extends Message {
  static override create(data: Record<string, unknown>[]): BlockChain {
    return BlockChain.fromJSON(data);
  }

  static override serialize(blockChain: BlockChain): string {
    return super.serialize(
      blockChain.getChain().map((block) => block.toJSON()),
    );
  }

  static override readonly MESSAGE_TYPE = 'CHAIN';
}
