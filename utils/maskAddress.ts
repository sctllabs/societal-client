import { isEthereumAddress } from '@polkadot/util-crypto';

export function maskAddress(address: string) {
  if (isEthereumAddress(address)) {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  }

  return `${address.substring(0, 6)}...${address.substring(42)}`;
}
