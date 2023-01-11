import { blake2AsHex, decodeAddress } from '@polkadot/util-crypto';

export function ssToEvmAddress(_address: string) {
  return `0x${blake2AsHex(decodeAddress(_address), 256).substring(26)}`;
}
