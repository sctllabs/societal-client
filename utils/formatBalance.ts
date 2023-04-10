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

export function formatBalance(value: string) {
  const number = value.includes('.') ? parseFloat(value) : parseInt(value, 10);
  // eslint-disable-next-line no-bitwise
  const tier = (Math.log10(Math.abs(number)) / 3) | 0;

  if (tier === 0) {
    return number.toFixed(2);
  }

  const suffix = SI_SYMBOL[tier];
  const scale = 10 ** (tier * 3);

  const scaled = number / scale;

  return `${scaled.toFixed(2)} ${suffix}`;
}
