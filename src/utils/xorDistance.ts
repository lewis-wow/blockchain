export const xorDistance = (a: string, b: string): bigint => {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  const result = Buffer.alloc(bufA.length);
  for (let i = 0; i < bufA.length; i++) {
    result[i] = bufA[i] ^ bufB[i];
  }

  return BigInt('0x' + result.toString('hex'));
};
