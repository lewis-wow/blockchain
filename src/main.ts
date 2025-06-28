import { Block } from './blockchain/Block.js';

const genesisBlock = Block.genesis();

console.log(genesisBlock.toString());

const nextBlock = Block.mineBlock(genesisBlock, {
  hello: 'world',
});

console.log(nextBlock.toString());
