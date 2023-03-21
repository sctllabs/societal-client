import { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { apiAtom, keyringAtom } from 'store/api';
import { retrieveChainInfo } from 'utils/retrieveChainInfo';

export function PreloaderKeyring() {
  const api = useAtomValue(apiAtom);
  const [keyring, setKeyring] = useAtom(keyringAtom);

  useEffect(() => {
    if (!api || keyring) {
      return;
    }

    (async () => {
      const { isTestChain } = await import('@polkadot/util');
      const { keyring: uikeyring } = await import('@polkadot/ui-keyring');

      try {
        const { systemChain, systemChainType } = await retrieveChainInfo(api);
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
    })();
  }, [api, keyring, setKeyring]);

  return null;
}
