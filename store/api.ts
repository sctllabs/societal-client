import { atom } from 'jotai';
import { ApiPromise } from '@polkadot/api';
import { DefinitionRpc, DefinitionRpcSub } from '@polkadot/types/types';
import { Keyring } from '@polkadot/ui-keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';

import { appConfig } from 'config';

export enum API_STATE {
  CONNECT_INIT = 'CONNECT_INIT',
  CONNECTING = 'CONNECTING',
  READY = 'READY',
  ERROR = 'ERROR',
  DISCONNECTED = 'DISCONNECTED'
}

export const socketAtom = atom<string>(appConfig.providerSocket);
export const jsonrpcAtom = atom<
  Record<string, Record<string, DefinitionRpc | DefinitionRpcSub>>
>({ ...jsonrpc, ...appConfig.customRPCMethods });
export const keyringAtom = atom<Keyring | null>(null);
export const apiAtom = atom<ApiPromise | null>(null);
export const apiStateAtom = atom<API_STATE>(API_STATE.DISCONNECTED);
export const apiErrorAtom = atom<string | null>(null);
export const currentAccountAtom = atom<KeyringPair | null>(null);
