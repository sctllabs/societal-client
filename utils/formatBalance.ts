export function formatBalance(value: bigint) {
  return Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(value);
}
