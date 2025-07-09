import { BlockChain } from '../blockchain/BlockChain.js';
import { JSONArray } from '../types.js';
import { Contract } from './Contract.js';

export const p2pSyncChainsContract = new Contract({
  parse: (data: JSONArray): BlockChain => BlockChain.fromJSON(data),
  serialize: (data: BlockChain): JSONArray => data.toJSON(),
  type: 'P2P_TRANSACTION',
});
