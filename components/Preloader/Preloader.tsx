import { useCallback, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { ApiPromise } from '@polkadot/api';
import { ChainType } from '@polkadot/types/interfaces';

import {
  API_STATE,
  apiAtom,
  apiStateAtom,
  jsonrpcAtom,
  keyringAtom,
  socketAtom
} from 'store/api';
import { appConfig } from 'config';

export const retrieveChainInfo = async (api: ApiPromise) => {
  const { TypeRegistry } = await import('@polkadot/types/create');
  const registry = new TypeRegistry();

  const [systemChain, systemChainType] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.chainType
      ? api.rpc.system.chainType()
      : Promise.resolve(registry.createType('ChainType', 'Live') as ChainType)
  ]);

  return {
    systemChain: (systemChain || '<unknown>').toString(),
    systemChainType
  };
};

export function Preloader() {
  const [api, setApi] = useAtom(apiAtom);
  const [apiState, setApiState] = useAtom(apiStateAtom);
  const [keyring, setKeyring] = useAtom(keyringAtom);
  const setJsonRPC = useSetAtom(jsonrpcAtom);
  const socket = useAtomValue(socketAtom);

  const loadAccounts = useCallback(async () => {
    if (apiState !== API_STATE.READY || keyring || !api) {
      return;
    }

    const { web3Enable, web3Accounts } = await import(
      '@polkadot/extension-dapp'
    );
    const { isTestChain } = await import('@polkadot/util');
    const { keyring: uikeyring } = await import('@polkadot/ui-keyring');

    try {
      await web3Enable(appConfig.appName);
      let allAccounts = await web3Accounts();

      allAccounts = allAccounts.map(({ address, meta }) => ({
        address,
        meta: { ...meta, name: `${meta.name} (${meta.source})` }
      }));

      const { systemChain, systemChainType } = await retrieveChainInfo(api);
      const isDevelopment =
        systemChainType.isDevelopment ||
        systemChainType.isLocal ||
        isTestChain(systemChain);

      uikeyring.loadAll({ isDevelopment }, allAccounts);

      setKeyring(uikeyring);
    } catch (e) {
      setKeyring(null);
    }
  }, [api, apiState, keyring, setKeyring]);

  const connect = useCallback(async () => {
    if (apiState !== API_STATE.NOT_INITIALIZED) {
      return;
    }

    const jsonrpc = (await import('@polkadot/types/interfaces/jsonrpc'))
      .default;
    const { ApiPromise: ImportedApiPromise, WsProvider } = await import(
      '@polkadot/api'
    );

    const rpc = { ...jsonrpc, ...appConfig.customRPCMethods };
    setApiState(API_STATE.CONNECT_INIT);
    setJsonRPC(rpc);

    const provider = new WsProvider(socket);
    const _api = new ImportedApiPromise({ provider, rpc });

    _api.on('connected', () => {
      setApiState(API_STATE.CONNECTING);
      setApi(_api);
      _api.isReady.then(() => setApiState(API_STATE.READY));
    });
    _api.on('ready', () => setApiState(API_STATE.READY));
    _api.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error(err);
      setApiState(API_STATE.ERROR);
    });
    _api.on('disconnected', () => setApiState(API_STATE.DISCONNECTED));
  }, [apiState, setApi, setApiState, setJsonRPC, socket]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    connect();
  }, [connect]);

  return null;
}
