import { TypedEventEmitter } from '../event_emitter/TypedEventEmitter.js';

export type P2pNodeEventMap = {};

export class P2pNode extends TypedEventEmitter<P2pNodeEventMap> {}
