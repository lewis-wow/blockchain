import { BlockChain } from '../blockchain/BlockChain.js';
import { P2pServer } from './P2pServer.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { HttpServer } from './HttpServer.js';
import { TransactionPool } from '../cryptocurrency/TransactionPool.js';
import { Wallet } from '../cryptocurrency/Wallet.js';
import { HttpBootstrapServer } from './HttpBootstrapServer.js';

yargs(hideBin(process.argv))
  .command(
    'serve <port> <wsport> [peers..]',
    'start the server',
    (yargs) => {
      return yargs
        .positional('port', {
          describe: 'port to bind on http server',
          type: 'number',
          default: 3000,
        })
        .positional('wsport', {
          describe: 'port to bind on peer-to-peer server',
          type: 'number',
        })
        .positional('peers', {
          describe: 'List of peer addresses',
          type: 'string',
          array: true,
          default: [],
        });
    },
    async (argv) => {
      const port = argv.port ?? 3000;
      const wsport = argv.wsport ?? port + 2000;
      const peers = argv.peers;

      const blockChain = new BlockChain();
      const wallet = new Wallet();
      const transactionPool = new TransactionPool();

      const p2pServer = new P2pServer({
        blockChain,
        transactionPool,
        peers,
      });

      p2pServer.listen({ port: wsport });

      const httpServer = new HttpServer({
        blockChain,
        p2pServer,
        wallet,
        transactionPool,
      });

      httpServer.listen({ port });
    },
  )
  .command(
    'bootstrap <port>',
    'start the bootstrap server',
    (yargs) => {
      return yargs.positional('port', {
        describe: 'port to bind on http bootstrap server',
        type: 'number',
        default: 4000,
      });
    },
    (argv) => {
      const port = argv.port;

      const httpBootstrapServer = new HttpBootstrapServer();

      httpBootstrapServer.listen({ port });
    },
  )
  .help()
  .parse();
