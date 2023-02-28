type AccountType = 'eth' | 'ss58';

export function maskAddress(address: string, type: AccountType) {
  if (type === 'eth') {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  }

  return `${address.substring(0, 6)}...${address.substring(42)}`;
}
