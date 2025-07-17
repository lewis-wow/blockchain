/**
 * Common
 */
export const HOSTNAME = 'localhost';
export const HTTP_SERVER_PROTOCOL = 'http';
export const BOOTSTRAP_SERVER_PROTOCOL = 'http';
export const P2P_SERVER_PROTOCOL = 'ws';

// The number of bits in the Node ID
export const ID_BITS = 32;
export const ID_BYTES = ID_BITS / 8;

/**
 * Blockchain
 */
export const MINER_MINING_REWARD = 50;
export const KEY_PAIR_SIGN_ALGORITHM = 'SHA256';
export const WALLET_INITIAL_BALANCE = 500;
// Initial genesis block difficulty
export const BLOCK_DIFFICULTY = 3;
// Mine rate for adjusting dynamic difficulty for new block
export const BLOCK_MINE_RATE = 3000; // ms

/**
 * Kademlia
 */
// The 'k' parameter from the Kademlia paper. It is the maximum
// number of contacts stored in a single k-bucket.
export const K_BUCKET_SIZE = 8;

// concurrency parameter for lookups.
export const ALPHA = 3;

/**
 * Logger
 */
export const LOG_LEVEL = 'debug';
