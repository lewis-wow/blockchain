import { BlockChain } from '../blockchain/BlockChain.js';
import { P2pServer } from './P2pServer.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { HttpServer } from './HttpServer.js';
import { TransactionPool } from '../cryptocurrency/TransactionPool.js';
import { Wallet } from '../cryptocurrency/Wallet.js';
import { Miner } from '../cryptocurrency/Miner.js';
import { DhtServer } from './DhtServer.js';

yargs(hideBin(process.argv))
  .command(
    'serve <port>',
    'start the server',
    (yargs) => {
      return yargs.positional('port', {
        describe: 'port to bind on http server',
        type: 'number',
        default: 3000,
      });
    },
    async (argv) => {
      const port = argv.port;
      const p2pPort = port + 1000;
      const dhtPort = port + 2000;
      const peers = [];

      const blockChain = new BlockChain();
      const wallet = new Wallet();
      const transactionPool = new TransactionPool();

      const p2pServer = new P2pServer({
        blockChain,
        transactionPool,
        peers,
        port: p2pPort,
      });
      p2pServer.listen();

      const dhtServer = new DhtServer({
        port: dhtPort,
      });
      dhtServer.listen();

      const miner = new Miner({
        blockChain,
        p2pServer,
        wallet,
        transactionPool,
      });

      const httpServer = new HttpServer({
        blockChain,
        p2pServer,
        wallet,
        transactionPool,
        miner,
        port,
      });
      httpServer.listen();
    },
  )
  .help()
  .parse();
