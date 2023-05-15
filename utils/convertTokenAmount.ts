export function convertTokenAmount(amount: string, decimals: number): string {
  return amount.padEnd(++decimals, '0');
}
