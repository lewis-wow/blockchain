import { ID_BYTES } from '../consts.js';

export class Utils {
  /**
   * Calculates the Kademlia distance between two Node IDs using XOR.
   * @param idA The first Node ID.
   * @param idB The second Node ID.
   * @returns A buffer representing the distance.
   */
  static distance(idA: Buffer, idB: Buffer): Buffer {
    const dist = Buffer.alloc(ID_BYTES);
    for (let i = 0; i < ID_BYTES; i++) {
      dist[i] = idA[i] ^ idB[i];
    }
    return dist;
  }

  /**
   * Compares two distances (or Node IDs).
   * @returns -1 if a < b, 0 if a === b, 1 if a > b.
   */
  static compareDistance(a: Buffer, b: Buffer): number {
    return a.compare(b);
  }

  static getBucketIndex(baseId: Buffer, remoteId: Buffer): number {
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
