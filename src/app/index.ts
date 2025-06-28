import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { BlockChain } from '../blockchain/BlockChain.js';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const blockChain = new BlockChain();

const hono = new Hono();

hono.get('/blocks', (c) => {
  return c.json(blockChain.getChain());
});

hono.post('/mine', zValidator('json', z.record(z.unknown())), (c) => {
  const data = c.req.valid('json');

  const newBlock = blockChain.addBlock(data);

  return c.json(newBlock.toJSON());
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
