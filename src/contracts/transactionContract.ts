import { Transaction } from '../cryptocurrency/Transaction.js';
import { JSONObject } from '../types.js';
import { Contract } from './Contract.js';

export const transactionContract = new Contract({
  parse: (data: JSONObject): Transaction => Transaction.fromJSON(data),
  serialize: (data: Transaction): JSONObject => data.toJSON(),
  type: 'TRANSACTION',
});
