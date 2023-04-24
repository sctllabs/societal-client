import { BN } from '@polkadot/util';

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

export function formatBalance(balance: string, decimals: number | null) {
  const base = new BN(10).pow(new BN(decimals || 0));
  const dm = new BN(balance).divmod(base);

  return parseFloat(
    dm.div.toString() + '.' + dm.mod.toString().substring(0, 4)
  );
}
