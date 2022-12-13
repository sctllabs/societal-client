import { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import { Keyring, keyring as uikeyring } from '@polkadot/ui-keyring';

import { API_STATE, apiAtom, apiStateAtom, keyringAtom } from 'store/api';
import { appConfig } from 'config';

export const useKeyring = (): Keyring | null => {
  const [keyring, setKeyring] = useAtom(keyringAtom);
  const apiState = useAtomValue(apiStateAtom);
  const api = useAtomValue(apiAtom);

  useEffect(() => {
    const retrieveChainInfo = async (api: any) => {
      const { TypeRegistry } = await import('@polkadot/types/create');
      const registry = new TypeRegistry();

      const [systemChain, systemChainType] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.chainType
          ? api.rpc.system.chainType()
          : Promise.resolve(registry.createType('ChainType', 'Live'))
      ]);

      return {
        systemChain: (systemChain || '<unknown>').toString(),
        systemChainType
      };
    };

    const loadAccounts = async (): Promise<void> => {
      const { isTestChain } = await import('@polkadot/util');

      try {
        await web3Enable(appConfig.appName);
        let allAccounts = await web3Accounts();

        allAccounts = allAccounts.map(({ address, meta }) => ({
          address,
          meta: { ...meta, name: `${meta.name} (${meta.source})` }
        }));

        // Logics to check if the connecting chain is a dev chain, coming from polkadot-js Apps
        // ref: https://github.com/polkadot-js/apps/blob/15b8004b2791eced0dde425d5dc7231a5f86c682/packages/react-api/src/Api.tsx?_pjax=div%5Bitemtype%3D%22http%3A%2F%2Fschema.org%2FSoftwareSourceCode%22%5D%20%3E%20main#L101-L110
        const { systemChain, systemChainType } = await retrieveChainInfo(api);
        const isDevelopment =
          systemChainType.isDevelopment ||
          systemChainType.isLocal ||
          isTestChain(systemChain);

        uikeyring.loadAll({ isDevelopment }, allAccounts);

        setKeyring(uikeyring);
      } catch (e) {
        console.error(e);
        setKeyring(null);
      }
    };

    if (apiState !== API_STATE.READY) {
      return;
    }

    void loadAccounts();
  }, [apiState]);

  return keyring;
};
