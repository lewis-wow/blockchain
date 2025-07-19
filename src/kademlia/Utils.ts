import { ID_BYTES } from '../consts.js';

export class Utils {
  /**
   * Calculates the Kademlia distance between two Node IDs using XOR.
   * Kademlia distance is a metric used to determine how "close" two Node IDs are.
   * It is calculated by performing a bitwise XOR operation on the binary representations of the IDs.
   * @param idA The first Node ID (expected as a hexadecimal string).
   * @param idB The second Node ID (expected as a hexadecimal string).
   * @returns A BigInt representing the distance. Using BigInt allows for handling large Node IDs that exceed standard number limits.
   */
  static distance(idA: string, idB: string): bigint {
    // Convert hexadecimal string IDs to BigInts for bitwise operations.
    // The '0x' prefix ensures that the string is interpreted as a hexadecimal number.
    const bigIntIDA = BigInt('0x' + idA);
    const bigIntIDB = BigInt('0x' + idB);

    // Perform the XOR operation directly on the BigInts.
    // The XOR operation results in a new BigInt where each bit is 1 if the corresponding bits of idA and idB are different, and 0 if they are the same.
    const dist = bigIntIDA ^ bigIntIDB;

    return dist;
  }

  /**
   * Compares two distances (BigInts).
   * This utility function provides a standard comparison logic similar to `Array.prototype.sort` callbacks.
   * @param a The first distance (BigInt) to compare.
   * @param b The second distance (BigInt) to compare.
   * @returns -1 if `a` is less than `b`, 0 if `a` is equal to `b`, or 1 if `a` is greater than `b`.
   */
  static compareDistance(a: bigint, b: bigint): number {
    if (a < b) {
      return -1;
    }

    if (a > b) {
      return 1;
    }

    return 0; // If neither a < b nor a > b, then a must be equal to b.
  }

  /**
   * Calculates the Kademlia bucket index for a given remote Node ID relative to a base Node ID.
   * The bucket index is determined by the length of the common prefix (in bits) of the XOR distance
   * between the two IDs and the total ID length. More specifically, it's the position of the most
   * significant bit that differs between the two IDs.
   * @param baseId The base Node ID (local node's ID, as a hexadecimal string).
   * @param remoteId The remote Node ID (as a hexadecimal string).
   * @returns The bucket index, which corresponds to the number of leading zero bits in the XOR distance.
   */
  static getBucketIndex(baseId: string, remoteId: string): number {
    // Calculate the Kademlia XOR distance between the two IDs.
    // Note: The original `d` was a Buffer, now it's a BigInt. This `getBucketIndex`
    // logic needs to be adapted for BigInt. The current implementation implicitly
    // assumes `d` is still a Buffer of bytes (e.g., `d[i]` access).
    // This part of the code requires a careful re-evaluation for BigInts.
    // For a BigInt, you'd typically look for the most significant bit (MSB)
    // using BigInt methods or converting to a binary string.

    // --- REVISED LOGIC FOR BIGINT DISTANCE ---
    // If 'd' is a BigInt, direct byte access (d[i]) is not valid.
    // We need to find the position of the most significant '1' bit in the BigInt distance.
    // This is equivalent to finding `floor(log2(d))` if d > 0.
    // The Kademlia bucket index for a 160-bit ID (ID_BYTES = 20) is typically
    // `ID_BITS - MSB_position - 1` or similar, depending on definition.

    // Let's assume ID_BYTES represents the total length of the ID in bytes.
    // If Kademlia IDs are 160 bits (20 bytes), then `ID_BYTES * 8` is the total number of bits.

    const distanceBigInt = Utils.distance(baseId, remoteId);

    if (distanceBigInt === 0n) {
      // If distance is 0, the IDs are identical. This usually means they are in the
      // "same bucket" or at the "deepest" level, typically represented by the maximum bucket index.
      return ID_BYTES * 8 - 1; // Or some max value depending on protocol definition.
    }

    let bitLength = 0;
    let tempDistance = distanceBigInt;
    while (tempDistance > 0n) {
      tempDistance >>= 1n; // Right shift by 1 bit
      bitLength++; // Increment bit length
    }

    // The bucket index is typically (total_bits - (position_of_most_significant_bit_that_differs + 1)).
    // Or, simpler, the number of leading zero bits in the XOR distance.
    // If ID_BYTES * 8 is the total number of bits for the ID.
    // And `bitLength` is the actual number of bits used by the `distanceBigInt`.
    // Then `(ID_BYTES * 8) - bitLength` gives the number of leading zeros.
    return ID_BYTES * 8 - bitLength;
  }
}
