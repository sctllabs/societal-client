import { isEthereumAddress } from '@polkadot/util-crypto';

export function maskAddress(address: string) {
  if (address.length < 20) {
    return address;
  }

  if (isEthereumAddress(address)) {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  }

  return `${address.substring(0, 6)}...${address.substring(42)}`;
}
