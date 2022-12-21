import { atom } from 'jotai';
import { KeyringPair } from '@polkadot/keyring/types';
import { keyringAtom } from './api';

const accountStorageKey = 'currentAccountAddress';

export const currentAccountAddressAtom = atom<string | null>(
  typeof window !== 'undefined' ? localStorage.getItem(accountStorageKey) : null
);

export const currentAccountAtom = atom<KeyringPair | null>(null);

export const setCurrentAccountAtom = atom(
  null,
  (_get, _set, account: KeyringPair) => {
    const _currentAccountAddress = _get(currentAccountAddressAtom);

    _set(currentAccountAtom, account);

    if (_currentAccountAddress !== account.address.toString()) {
      _set(currentAccountAddressAtom, account.address.toString());
      localStorage.setItem(accountStorageKey, account.address);
    }
  }
);

export const accountsAtom = atom((_get) => _get(keyringAtom)?.getPairs());
