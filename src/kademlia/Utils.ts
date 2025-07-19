import { ID_BYTES } from '../consts.js';

export class Utils {
  /**
   * Calculates the Kademlia distance between two Node IDs using XOR.
   * @param idA The first Node ID (expected as a hexadecimal string).
   * @param idB The second Node ID (expected as a hexadecimal string).
   * @returns A BigInt representing the distance.
   */
  static distance(idA: string, idB: string): bigint {
    // Convert hexadecimal string IDs to BigInts
    const bigIntIDA = BigInt('0x' + idA);
    const bigIntIDB = BigInt('0x' + idB);

    // Perform the XOR operation directly on the BigInts
    const dist = bigIntIDA ^ bigIntIDB;

    return dist;
  }

  /**
   * Compares two distances.
   * @returns -1 if a < b, 0 if a === b, 1 if a > b.
   */
  static compareDistance(a: bigint, b: bigint): number {
    if (a < b) {
      return -1;
    }

    if (a > b) {
      return 1;
    }

    return 0;
  }

  static getBucketIndex(baseId: string, remoteId: string): number {
    const d = Utils.distance(baseId, remoteId);
    let commonPrefixLength = 0;
    for (let i = 0; i < ID_BYTES; i++) {
      const byte = d[i];
      if (byte === 0) {
        commonPrefixLength += 8;
      } else {
        // Find the first set bit
        for (let j = 7; j >= 0; j--) {
          if ((byte >> j) & 1) {
            break;
          }
          commonPrefixLength++;
        }
        break;
      }
    }
    return commonPrefixLength;
  }
}
