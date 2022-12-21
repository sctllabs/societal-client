import { useCallback, useEffect, useRef } from 'react';
import { appConfig } from 'config';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  apiAtom,
  apiConnectedAtom,
  apiErrorAtom,
  jsonrpcAtom,
  keyringAtom,
  socketAtom
} from 'store/api';
import {
  currentAccountAddressAtom,
  setCurrentAccountAtom
} from 'store/account';
import { retrieveChainInfo } from 'utils';
import type { ApiPromise } from '@polkadot/api';
import type { Keyring } from '@polkadot/ui-keyring';

export function Preloader() {
  const connectRef = useRef<boolean>(false);

  const [api, setApi] = useAtom(apiAtom);
  const [keyring, setKeyring] = useAtom(keyringAtom);
  const currentAccountAddress = useAtomValue(currentAccountAddressAtom);
  const socket = useAtomValue(socketAtom);
  const setApiError = useSetAtom(apiErrorAtom);
  const setJsonRPC = useSetAtom(jsonrpcAtom);
  const setApiConnected = useSetAtom(apiConnectedAtom);
  const setCurrentAccount = useSetAtom(setCurrentAccountAtom);

  const loadCurrentAccount = useCallback(
    (_keyring: Keyring, _currentAccountAddress: string) =>
      setCurrentAccount(_keyring.getPair(_currentAccountAddress)),
    [setCurrentAccount]
  );

  const loadAccounts = useCallback(
    async (_api: ApiPromise) => {
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

        const { systemChain, systemChainType } = await retrieveChainInfo(_api);
        const isDevelopment =
          systemChainType.isDevelopment ||
          systemChainType.isLocal ||
          isTestChain(systemChain);

        uikeyring.loadAll({ isDevelopment }, allAccounts);

        setKeyring(uikeyring);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    },
    [setKeyring]
  );

  const connect = useCallback(async () => {
    const jsonrpc = (await import('@polkadot/types/interfaces/jsonrpc'))
      .default;
    const { ApiPromise, WsProvider } = await import('@polkadot/api');

    const rpc = { ...jsonrpc, ...appConfig.customRPCMethods };
    setJsonRPC(rpc);

    const provider = new WsProvider(socket);
    const _api = new ApiPromise({ provider, rpc });

    _api.on('connected', () => setApiConnected(true));
    _api.on('disconnected', () => setApiConnected(false));
    _api.on('error', (err: Error) => setApiError(err.message));
    _api.on('ready', () => setApi(_api));
  }, [setApi, setApiConnected, setApiError, setJsonRPC, socket]);

  useEffect(() => {
    if (!keyring || !currentAccountAddress) {
      return;
    }

    loadCurrentAccount(keyring, currentAccountAddress);
  }, [currentAccountAddress, keyring, loadCurrentAccount]);

  useEffect(() => {
    if (!api || keyring) {
      return;
    }

    loadAccounts(api);
  }, [api, keyring, loadAccounts]);

  useEffect(() => {
    if (connectRef.current) {
      return;
    }

    connect();
    connectRef.current = true;
  }, [connect]);

  return null;
}
