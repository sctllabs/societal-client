import { atom } from 'jotai';
import { appConfig } from 'config';

import { Keyring } from '@polkadot/ui-keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { DefinitionRpc, DefinitionRpcSub } from '@polkadot/types/types';
import { ApiPromise } from '@polkadot/api';

export enum API_STATE {
  CONNECT_INIT = 'CONNECT_INIT',
  CONNECTING = 'CONNECTING',
  READY = 'READY',
  ERROR = 'ERROR',
  DISCONNECTED = 'DISCONNECTED',
  NOT_INITIALIZED = 'NOT_INITIALIZED'
}

export const socketAtom = atom<string>(appConfig.providerSocket);
export const jsonrpcAtom = atom<
  Record<string, Record<string, DefinitionRpc | DefinitionRpcSub>>
>({});

export const apiAtom = atom<ApiPromise | null>(null);
export const keyringAtom = atom<Keyring | null>(null);
export const apiStateAtom = atom<API_STATE>(API_STATE.NOT_INITIALIZED);
export const currentAccountAtom = atom<KeyringPair | null>(null);
export const apiKeyringAtom = atom<[ApiPromise | null, Keyring | null]>(
  (get) => [get(apiAtom), get(keyringAtom)]
);
