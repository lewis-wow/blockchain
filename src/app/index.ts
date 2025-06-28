import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { BlockChain } from '../blockchain/BlockChain.js';

const blockChain = new BlockChain();

const hono = new Hono();

hono.get('/blocks', (c) => {
  return c.json(blockChain.getChain());
});

const port = 3000;

serve(
  {
    fetch: hono.fetch,
    port,
  },
  () => {
    console.log(`Server running on http://localhost:${port}`);
  },
);
