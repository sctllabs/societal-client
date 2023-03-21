import { atom } from 'jotai';
import { DaoToken } from 'types';

export const tokenNameAtom = atom<string | null>(null);
export const tokenSymbolAtom = atom<string | null>(null);
export const tokenDecimalsAtom = atom<number | null>(null);
export const tokenQuantityAtom = atom<string | null>(null);
export const tokenLoadingAtom = atom<boolean>(false);

export const tokenAtom = atom(
  (get) => ({
    name: get(tokenNameAtom),
    symbol: get(tokenSymbolAtom),
    decimals: get(tokenDecimalsAtom),
    quantity: get(tokenQuantityAtom)
  }),
  (_get, _set, { name, symbol, decimals, quantity }: DaoToken) => {
    const _name = _get(tokenNameAtom);
    const _symbol = _get(tokenSymbolAtom);
    const _decimals = _get(tokenDecimalsAtom);
    const _quantity = _get(tokenQuantityAtom);

    if (_name !== name) {
      _set(tokenNameAtom, name);
    }
    if (_symbol !== symbol) {
      _set(tokenSymbolAtom, symbol);
    }
    if (_decimals !== decimals) {
      _set(tokenDecimalsAtom, decimals);
    }
    if (_quantity !== quantity) {
      _set(tokenQuantityAtom, quantity);
    }
  }
);
