export function convertTokenAmount(amount: string, decimals: number): string {
  return amount.padEnd(amount.length + decimals, '0');
}
