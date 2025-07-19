import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { App } from './App.js';

yargs(hideBin(process.argv))
  .command(
    '$0 [port] [bootstrapNetworkIdentifier]',
    'start the server',
    (yargs) => {
      return yargs
        .positional('port', {
          describe: 'port to bind on http server',
          type: 'number',
        })
        .positional('bootstrapNetworkIdentifier', {
          describe: 'bootstrap server addresss in format nodeId@hostname:port',
          type: 'string',
        });
    },
    (argv) => {
      const app = new App({
        basePort: argv.port,
        bootstrapNetworkIdentifier: argv.bootstrapNetworkIdentifier,
      });
      app.listen();
    },
  )
  .help()
  .parse();
