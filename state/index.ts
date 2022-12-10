import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { ApiPromise } from '@polkadot/api';
import { DefinitionRpc, DefinitionRpcSub } from '@polkadot/types/types';
import { Keyring } from '@polkadot/ui-keyring';
import { KeyringPair } from '@polkadot/keyring/types';

import { appConfig } from 'config';

const connectedSocket = appConfig.providerSocket;

export enum API_STATE {
  CONNECT_INIT = 'CONNECT_INIT',
  CONNECTING = 'CONNECTING',
  READY = 'READY',
  ERROR = 'ERROR',
  LOADING = 'LOADING'
}

type State = {
  socket: string;
  jsonrpc: Record<string, Record<string, DefinitionRpc | DefinitionRpcSub>>;
  keyring: Keyring | null;
  keyringState: API_STATE | null;
  api: any;
  apiError: string | null;
  apiState: API_STATE | null;
  currentAccount: KeyringPair | null;
};

type Actions = {
  setApiState: (apiState: API_STATE) => void;
  setApi: (api: ApiPromise) => void;
  setError: (error: any) => void;
  setCurrentAccount: (account: KeyringPair) => void;
};

export const useStore = create(
  immer<State & Actions>((set) => ({
    socket: connectedSocket,
    jsonrpc: {},
    keyring: null,
    keyringState: null,
    api: null,
    apiError: null,
    apiState: null,
    currentAccount: null,
    setApiState: (apiState) => set((state) => ({ apiState })),
    setApi: (api) => set((state) => ({ api })),
    setError: (error) => set((state) => ({ apiError: error })),
    setCurrentAccount: (account) =>
      set((state) => ({ currentAccount: account }))
  }))
);
