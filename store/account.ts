import { atom } from 'jotai';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { JsonRpcSigner } from '@ethersproject/providers';
import { keyringAtom } from './api';

const substrateAccountStorageKey = 'substrateAccountStorageKey';
const metamaskAccountStorageKey = 'metamaskAccountStorageKey';

// Metamask
export const metamaskAccountAddressAtom = atom<string | null>(null);
export const metamaskAccountAtom = atom<JsonRpcSigner | null>(null);
export const persistMetamaskAccountAtom = atom<string | null>(
  typeof window !== 'undefined'
    ? localStorage.getItem(metamaskAccountStorageKey)
    : null
);
export const setCurrentMetamaskAccountAtom = atom(
  null,
  async (_get, _set, _account: JsonRpcSigner | null) => {
    _set(metamaskAccountAtom, _account);

    const accountAddress = (await _account?.getAddress()) ?? null;
    _set(metamaskAccountAddressAtom, accountAddress);

    if (accountAddress) {
      localStorage.setItem(metamaskAccountStorageKey, accountAddress);
    } else {
      localStorage.removeItem(metamaskAccountStorageKey);
    }
  }
);

// Substrate
export const substrateAccountAddressAtom = atom<string | null>(
  typeof window !== 'undefined'
    ? localStorage.getItem(substrateAccountStorageKey)
    : null
);
export const substrateAccountAtom = atom<KeyringPair | null>(null);
export const setCurrentSubstrateAccountAtom = atom(
  null,
  (_get, _set, _account: KeyringPair | null) => {
    _set(substrateAccountAtom, _account);
    _set(substrateAccountAddressAtom, _account?.address.toString() ?? null);

    if (_account) {
      localStorage.setItem(substrateAccountStorageKey, _account.address);
    } else {
      localStorage.removeItem(substrateAccountStorageKey);
    }
  }
);

export const accountsAtom = atom((_get) => _get(keyringAtom)?.getPairs());

export const currentAccountAtom = atom(
  (_get) => _get(metamaskAccountAtom) ?? _get(substrateAccountAtom)
);
