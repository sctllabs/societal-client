import { useCallback, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { Keyring, keyring as uikeyring } from '@polkadot/ui-keyring';
import { ChainType } from '@polkadot/types/interfaces';
import { isTestChain } from '@polkadot/util';
import { TypeRegistry } from '@polkadot/types/create';

import { API_STATE, apiAtom, apiStateAtom, keyringAtom } from 'store/api';
import { appConfig } from 'config';

export const useKeyring = (): Keyring | null => {
  const [keyring, setKeyring] = useAtom(keyringAtom);
  const apiState = useAtomValue(apiStateAtom);
  const api = useAtomValue(apiAtom);

  const retrieveChainInfo = useCallback(async () => {
    if (!api) {
      return undefined;
    }

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
  }, [api]);

  const loadAccounts = useCallback(async (): Promise<void> => {
    try {
      await web3Enable(appConfig.appName);
      let allAccounts = await web3Accounts();

      allAccounts = allAccounts.map(({ address, meta }) => ({
        address,
        meta: { ...meta, name: `${meta.name} (${meta.source})` }
      }));

      const chainInfo = await retrieveChainInfo();
      if (!chainInfo) {
        return;
      }
      const { systemChain, systemChainType } = chainInfo;
      const isDevelopment =
        systemChainType.isDevelopment ||
        systemChainType.isLocal ||
        isTestChain(systemChain);

      uikeyring.loadAll({ isDevelopment }, allAccounts);

      setKeyring(uikeyring);
    } catch (e) {
      setKeyring(null);
    }
  }, [retrieveChainInfo, setKeyring]);

  useEffect(() => {
    let keyringLoaded: boolean = false;

    if (apiState !== API_STATE.READY || keyring || keyringLoaded) {
      return undefined;
    }

    loadAccounts();

    return () => {
      keyringLoaded = true;
    };
  }, [apiState, keyring, loadAccounts]);

  return keyring;
};
