const SI_SYMBOL = [
  '',
  'K',
  'M',
  'B',
  'T',
  'Quadrillion',
  'Quintillion',
  'Sextillion',
  'Septillion',
  'Octillion',
  'Nonillion',
  'Decillion',
  'Undecillion',
  'Duodecillion',
  'Tredecillion',
  'Quattuor-decillion',
  'Quindecillion',
  'Sexdecillion',
  'Septendecillion',
  'Octodecillion',
  'Novemdecillion',
  'Vigintillion'
];

export function formatBalance(value: string, decimals?: number | null) {
  const number = value.includes('.') ? parseFloat(value) : parseInt(value, 10);
  // eslint-disable-next-line no-bitwise
  const tier = (Math.log10(Math.abs(number)) / 3) | 0;
  // eslint-disable-next-line no-bitwise
  const decimalTier =
    (Math.log10(Math.abs(number) / Math.pow(10, decimals || 0)) / 3) | 0;

  const decimalNumber = Math.abs(number) / Math.pow(10, decimals || 1);
  if (decimalTier < 0) {
    return decimalNumber.toFixed((decimals || 0) - tier * 3);
  } else if (decimalTier === 0) {
    return decimalNumber;
  }

  const suffix = SI_SYMBOL[decimalTier];
  const scale = 10 ** (decimalTier * 3);

  const scaled = decimalNumber / scale;

  return `${scaled.toFixed(0)}${suffix}`;
}
