import { atom } from 'jotai';
import { appConfig } from 'config';

import type { Keyring } from '@polkadot/ui-keyring';
import type { DefinitionRpc, DefinitionRpcSub } from '@polkadot/types/types';
import type { ApiPromise } from '@polkadot/api';

export const socketAtom = atom<string>(appConfig.providerSocket);
export const jsonrpcAtom = atom<
  Record<string, Record<string, DefinitionRpc | DefinitionRpcSub>>
>({});
export const apiAtom = atom<ApiPromise | null>(null);
export const keyringAtom = atom<Keyring | null>(null);
export const apiConnectedAtom = atom<boolean>(false);
export const apiErrorAtom = atom<string | null>(null);
