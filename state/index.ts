import create from 'zustand';
import { ApiPromise } from '@polkadot/api';
import { DefinitionRpc, DefinitionRpcSub } from '@polkadot/types/types';
import jsonrpc from '@polkadot/types/interfaces/jsonrpc';
import { immer } from 'zustand/middleware/immer';
import { Keyring } from '@polkadot/ui-keyring';

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
  currentAccount: any;
};

type Actions = {
  setApiState: (apiState: API_STATE) => void;
  setApi: (api: ApiPromise) => void;
  setError: (error: any) => void;
};

export const useStore = create(
  immer<State & Actions>((set, get) => ({
    socket: connectedSocket,
    jsonrpc: { ...jsonrpc, ...appConfig.customRPCMethods },
    keyring: null,
    keyringState: null,
    api: null,
    apiError: null,
    apiState: null,
    currentAccount: null,
    setApiState: (apiState) => set((state) => ({ apiState })),
    setApi: (api: any) => set((state) => ({ api })),
    setError: (error: any) => set((state) => ({ apiError: error }))
  }))
);
