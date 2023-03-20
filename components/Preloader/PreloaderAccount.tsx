import { useEffect } from 'react';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  disconnectAccountsAtom,
  persistMetamaskAccountAtom,
  setCurrentMetamaskAccountAtom,
  setCurrentSubstrateAccountAtom,
  substrateAccountAddressAtom,
  substrateWalletAtom
} from 'store/account';
import { keyringAtom } from 'store/api';

import type { WalletSource } from 'types';

export function PreloaderAccount() {
  const [keyring] = useAtom(keyringAtom);
  const persistMetamaskAccount = useAtomValue(persistMetamaskAccountAtom);
  const persistSubstrateAccount = useAtomValue(substrateAccountAddressAtom);
  const persistSubstrateWallet = useAtomValue(substrateWalletAtom);

  const setCurrentMetamaskAccount = useSetAtom(setCurrentMetamaskAccountAtom);
  const setCurrentSubstrateAccount = useSetAtom(setCurrentSubstrateAccountAtom);
  const disconnectAccounts = useSetAtom(disconnectAccountsAtom);

  useEffect(() => {
    if (!keyring) {
      return;
    }

    (async () => {
      try {
        if (persistMetamaskAccount) {
          const { metamaskWallet } = await import('providers/metamaskWallet');
          const signer = await metamaskWallet.connectWallet(
            keyring,
            persistMetamaskAccount
          );
          await setCurrentMetamaskAccount(signer);
        }

        // TODO: re-work wallet pre-loader approach
        if (persistSubstrateAccount) {
          const substrateWallet =
            persistSubstrateWallet && persistSubstrateWallet !== 'undefined'
              ? persistSubstrateWallet
              : 'polkadot-js';

          try {
            const { polkadotWallet } = await import('providers/polkadotWallet');
            await polkadotWallet.connectWallet(
              keyring,
              substrateWallet as WalletSource
            );

            setCurrentSubstrateAccount(
              keyring.getPair(persistSubstrateAccount as any)
            );
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
          }
        }
      } catch (e) {
        disconnectAccounts();
        // eslint-disable-next-line no-console
        console.error(e);
      }
    })();
  }, [
    disconnectAccounts,
    keyring,
    persistMetamaskAccount,
    persistSubstrateAccount,
    persistSubstrateWallet,
    setCurrentMetamaskAccount,
    setCurrentSubstrateAccount
  ]);

  return null;
}
