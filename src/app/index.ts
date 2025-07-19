import { BlockChain } from '../blockchain/BlockChain.js';
import { P2pServer } from './P2pServer.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { ApiServer } from './ApiServer.js';
import { TransactionPool } from '../cryptocurrency/TransactionPool.js';
import { Wallet } from '../cryptocurrency/Wallet.js';
import { Miner } from '../cryptocurrency/Miner.js';
import { Utils } from '../Utils.js';
import { KademliaServer } from '../kademlia/KademliaServer.js';
import { Contact } from '../Contact.js';

const DEFAULT_PORT = 3000;
const BOOTSTRAP_SERVER_REGEX = /^(.+)@(.+):(\d+)$/;

const SERVICE_NAME = 'app';
const log = Utils.defaultLog.child({ serviceName: SERVICE_NAME });

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
          describe: 'bootstrap server addresss in format nodeId@hostname:port',
          type: 'string',
        });
    },
    async (argv) => {
      const apiServerPort = argv.port;
      const p2pServerPort = apiServerPort + 1000;
      const kademliaServerPort = apiServerPort + 2000;

      const bootstrapRegexMatch = argv.bootstrap?.match(BOOTSTRAP_SERVER_REGEX);

      const {
        apiServerSelfContact,
        p2pServerSelfContact,
        kademliaServerSelfContact,
      } = Utils.createNodeSelfContacts({
        apiServerPort,
        p2pServerPort,
        kademliaServerPort,
      });

      const blockChain = new BlockChain();
      const wallet = new Wallet();
      const transactionPool = new TransactionPool();

      const kademliaServer = new KademliaServer(kademliaServerSelfContact);
      kademliaServer.listen();

      if (bootstrapRegexMatch) {
        const [, bootstrapNodeId, bootstrapHostname, bootstrapPort] =
          bootstrapRegexMatch;

        kademliaServer.bootstrap(
          Contact.fromJSON({
            host: bootstrapHostname,
            port: Number.parseInt(bootstrapPort),
            nodeId: bootstrapNodeId,
          }),
        );
      }

      const p2pServer = new P2pServer(p2pServerSelfContact, {
        blockChain,
        transactionPool,
        kademliaServer,
      });
      p2pServer.listen();

      const miner = new Miner({
        blockChain,
        p2pServer,
        wallet,
        transactionPool,
      });

      const apiServer = new ApiServer(apiServerSelfContact, {
        blockChain,
        p2pServer,
        wallet,
        transactionPool,
        miner,
      });
      apiServer.listen();

      log.info(
        `Bootstrap server listening on ${kademliaServer.getNetworkIdentifier()}.`,
      );
    },
  )
  .help()
  .parse();
