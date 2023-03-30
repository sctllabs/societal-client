import { atom } from 'jotai';
import { keyringAtom } from 'store/api';

import type { KeyringPair } from '@polkadot/keyring/types';
import type { JsonRpcSigner } from '@ethersproject/providers';
import type { AssetAccount } from '../types';

const substrateAccountStorageKey = 'substrateAccountStorageKey';
const substrateWalletStorageKey = 'substrateWalletStorageKey';
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
  async (_get, _set, _account: JsonRpcSigner) => {
    _set(metamaskAccountAtom, _account);

    const accountAddress = await _account?.getAddress();
    _set(metamaskAccountAddressAtom, accountAddress);

    localStorage.setItem(metamaskAccountStorageKey, accountAddress);
  }
);

// Substrate
export const substrateAccountAddressAtom = atom<string | null>(
  typeof window !== 'undefined'
    ? localStorage.getItem(substrateAccountStorageKey)
    : null
);
export const substrateWalletAtom = atom<string | null>(
  typeof window !== 'undefined'
    ? localStorage.getItem(substrateWalletStorageKey)
    : null
);
export const substrateAccountAtom = atom<KeyringPair | null>(null);
export const setCurrentSubstrateAccountAtom = atom(
  null,
  (_get, _set, _account: KeyringPair) => {
    _set(substrateAccountAtom, _account);
    _set(substrateAccountAddressAtom, _account?.address.toString());

    localStorage.setItem(substrateAccountStorageKey, _account.address);

    localStorage.setItem(
      substrateWalletStorageKey,
      _account.meta?.source as string
    );
  }
);

export const accountsAtom = atom((_get) =>
  _get(keyringAtom)
    ?.getPairs()
    .filter((_account) => {
      _get(substrateAccountAtom);
      if (_get(metamaskAccountAtom)) {
        return _account.meta.isEthereum;
      }
      return !_account.meta.isEthereum;
    })
);

export const currentAccountAtom = atom(
  (_get) => _get(metamaskAccountAtom) ?? _get(substrateAccountAtom)
);

export const disconnectAccountsAtom = atom(null, (_get, _set) => {
  localStorage.removeItem(substrateAccountStorageKey);
  localStorage.removeItem(substrateWalletStorageKey);
  localStorage.removeItem(metamaskAccountStorageKey);
  _set(metamaskAccountAtom, null);
  _set(metamaskAccountAddressAtom, null);
  _set(persistMetamaskAccountAtom, null);
  _set(substrateAccountAtom, null);
  _set(substrateAccountAddressAtom, null);
});

export const currentAccountBalanceAtom = atom<bigint | null>(null);
export const currentAccountTokenBalanceAtom = atom<
  AssetAccount | BigInt | null
>(null);
