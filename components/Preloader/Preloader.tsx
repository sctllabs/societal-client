import { useCallback, useEffect, useRef } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  apiAtom,
  apiConnectedAtom,
  apiErrorAtom,
  currentBlockAtom,
  jsonrpcAtom,
  keyringAtom,
  socketAtom
} from 'store/api';
import {
  setCurrentMetamaskAccountAtom,
  persistMetamaskAccountAtom,
  substrateAccountAddressAtom,
  setCurrentSubstrateAccountAtom,
  disconnectAccountsAtom,
  substrateWalletAtom
} from 'store/account';
import { appConfig } from 'config';
import { retrieveChainInfo } from 'utils/retrieveChainInfo';
import type { ApiPromise } from '@polkadot/api';
import type { Keyring } from '@polkadot/ui-keyring';
import type { u32 } from '@polkadot/types';
import { WalletSource } from 'types';

export function Preloader() {
  const connectRef = useRef<boolean>(false);
  const [api, setApi] = useAtom(apiAtom);
  const [keyring, setKeyring] = useAtom(keyringAtom);
  const persistMetamaskAccount = useAtomValue(persistMetamaskAccountAtom);
  const persistSubstrateAccount = useAtomValue(substrateAccountAddressAtom);
  const persistSubstrateWallet = useAtomValue(substrateWalletAtom);
  const socket = useAtomValue(socketAtom);
  const setApiError = useSetAtom(apiErrorAtom);
  const setJsonRPC = useSetAtom(jsonrpcAtom);
  const setApiConnected = useSetAtom(apiConnectedAtom);
  const setCurrentMetamaskAccount = useSetAtom(setCurrentMetamaskAccountAtom);
  const setCurrentSubstrateAccount = useSetAtom(setCurrentSubstrateAccountAtom);
  const setCurrentBlock = useSetAtom(currentBlockAtom);
  const disconnectAccounts = useSetAtom(disconnectAccountsAtom);

  const loadCurrentAccount = useCallback(
    async (
      _keyring: Keyring,
      _metamaskAccountAddress: string | null,
      _substrateAccountAddress: string | null,
      _substrateWallet: string | null
    ) => {
      try {
        if (_metamaskAccountAddress) {
          const { metamaskWallet } = await import('providers/metamaskWallet');
          const signer = await metamaskWallet.connectWallet(
            _keyring,
            _metamaskAccountAddress
          );
          await setCurrentMetamaskAccount(signer);
        }

        // TODO: re-work wallet pre-loader approach
        if (_substrateAccountAddress) {
          const substrateWallet =
            _substrateWallet && _substrateWallet !== 'undefined'
              ? _substrateWallet
              : 'polkadot-js';

          try {
            const { polkadotWallet } = await import('providers/polkadotWallet');
            await polkadotWallet.connectWallet(
              _keyring,
              substrateWallet as WalletSource
            );

            setCurrentSubstrateAccount(
              _keyring.getPair(_substrateAccountAddress as any)
            );
          } catch (e) {
            console.log(e);
          }
        }
      } catch (e) {
        disconnectAccounts();
        // eslint-disable-next-line no-console
        console.error(e);
      }
    },

    [disconnectAccounts, setCurrentMetamaskAccount, setCurrentSubstrateAccount]
  );

  const loadAccounts = useCallback(
    async (_api: ApiPromise) => {
      const { isTestChain } = await import('@polkadot/util');
      const { keyring: uikeyring } = await import('@polkadot/ui-keyring');

      try {
        const { systemChain, systemChainType } = await retrieveChainInfo(_api);
        const isDevelopment =
          systemChainType.isDevelopment ||
          systemChainType.isLocal ||
          isTestChain(systemChain);

        uikeyring.loadAll({ isDevelopment });

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
    let unsubscribe: any | null = null;

    api?.query.system
      .number((_currentBlock: u32) => setCurrentBlock(_currentBlock.toNumber()))
      .then((unsub) => {
        unsubscribe = unsub;
      });

    return () => unsubscribe && unsubscribe();
  }, [api, setCurrentBlock]);

  useEffect(() => {
    if (!keyring) {
      return;
    }

    loadCurrentAccount(
      keyring,
      persistMetamaskAccount,
      persistSubstrateAccount,
      persistSubstrateWallet
    );
  }, [
    persistMetamaskAccount,
    keyring,
    loadCurrentAccount,
    persistSubstrateAccount
  ]);

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
