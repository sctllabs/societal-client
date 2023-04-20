import { atom } from 'jotai';
import { DaoToken } from 'types';

export const tokenNameAtom = atom<string | null>(null);
export const tokenSymbolAtom = atom<string | null>(null);
export const tokenDecimalsAtom = atom<number | null>(null);
export const tokenQuantityAtom = atom<string | null>(null);
export const tokenLoadingAtom = atom<boolean>(false);
export const tokenAddressAtom = atom<string | null | undefined>(null);

export const tokenAtom = atom(
  (get) => ({
    name: get(tokenNameAtom),
    symbol: get(tokenSymbolAtom),
    decimals: get(tokenDecimalsAtom),
    quantity: get(tokenQuantityAtom),
    address: get(tokenAddressAtom)
  }),
  (_get, _set, { name, symbol, decimals, quantity, address }: DaoToken) => {
    const _name = _get(tokenNameAtom);
    const _symbol = _get(tokenSymbolAtom);
    const _decimals = _get(tokenDecimalsAtom);
    const _quantity = _get(tokenQuantityAtom);
    const _address = _get(tokenAddressAtom);

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
    if (_address !== address) {
      _set(tokenAddressAtom, address);
    }
  }
);

export const resetTokenAtom = atom(null, (_get, _set) => {
  _set(tokenNameAtom, null);
  _set(tokenSymbolAtom, null);
  _set(tokenDecimalsAtom, null);
  _set(tokenQuantityAtom, null);
  _set(tokenAddressAtom, null);
});
