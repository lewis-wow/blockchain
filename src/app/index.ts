import { BlockChain } from '../blockchain/BlockChain.js';
import { P2pServer } from '../p2p/P2pServer.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ApiServer } from '../api/ApiServer.js';
import { TransactionPool } from '../cryptocurrency/TransactionPool.js';
import { Wallet } from '../cryptocurrency/Wallet.js';
import { Miner } from '../cryptocurrency/Miner.js';
import { DhtServer } from './DhtServer.js';
import { Utils } from '../Utils.js';
import { HOSTNAME } from '../consts.js';

const DEFAULT_PORT = 3000;

yargs(hideBin(process.argv))
  .command(
    '$0 [port] [bootstrap]',
    'start the server',
    (yargs) => {
      return yargs
        .positional('port', {
          describe: 'port to bind on http server',
          type: 'number',
          default: DEFAULT_PORT,
        })
        .positional('bootstrap', {
          describe: 'bootstrap server addresss',
          type: 'string',
        });
    },
    async (argv) => {
      const selfNodeId = Utils.createNodeId();
      const port = argv.port;
      const bootstrap = argv.bootstrap;
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

      if (bootstrap) {
        dhtServer.join(bootstrap);
      }

      const miner = new Miner({
        blockChain,
        p2pServer,
        wallet,
        transactionPool,
      });

      const apiServer = new ApiServer(
        {
          nodeId: selfNodeId,
          host: HOSTNAME,
          port,
        },
        {
          blockChain,
          p2pServer,
          dhtServer,
          wallet,
          transactionPool,
          miner,
        },
      );
      apiServer.listen();
    },
  )
  .help()
  .parse();
