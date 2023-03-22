import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { apiAtom } from 'store/api';
import {
  currentAccountBalanceAtom,
  currentAccountTokenBalanceAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';
import { currentDaoAtom } from 'store/dao';
import { evmToAddress } from '@polkadot/util-crypto';
import type { AccountInfo, AssetBalance } from '@polkadot/types/interfaces';
import type { Option } from '@polkadot/types';
import { AssetAccount } from 'types';

export function PreloaderAccountBalance() {
  const api = useAtomValue(apiAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const setCurrentAccountBalance = useSetAtom(currentAccountBalanceAtom);
  const setCurrentAccountTokenBalance = useSetAtom(
    currentAccountTokenBalanceAtom
  );

  useEffect(() => {
    let accountAddress: string | undefined;
    let unsubscribe: any;

    if (!metamaskAccount && !substrateAccount) {
      setCurrentAccountBalance(null);
      return undefined;
    }

    if (substrateAccount) {
      accountAddress = substrateAccount.address;
    }

    if (metamaskAccount?._address) {
      accountAddress = evmToAddress(metamaskAccount._address);
    }

    if (!accountAddress) {
      return undefined;
    }

    api?.query.system
      .account(accountAddress, (accountInfo: AccountInfo) =>
        setCurrentAccountBalance(accountInfo.data.free.toBigInt())
      )
      .then((unsub) => {
        unsubscribe = unsub;
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e);
      });

    return () => unsubscribe && unsubscribe();
  }, [api, metamaskAccount, setCurrentAccountBalance, substrateAccount]);

  useEffect(() => {
    let accountAddress: string | undefined;
    let unsubscribe: any;

    if (!currentDao) {
      return undefined;
    }

    if (!metamaskAccount && !substrateAccount) {
      setCurrentAccountTokenBalance(null);
      return undefined;
    }

    if (substrateAccount) {
      accountAddress = substrateAccount.address;
    }

    if (metamaskAccount?._address) {
      accountAddress = metamaskAccount._address;
    }

    if (!accountAddress) {
      return undefined;
    }

    if (currentDao.fungibleToken?.id) {
      api?.query.assets
        .account(
          currentDao.fungibleToken.id,
          accountAddress,
          (_assetBalance: Option<AssetBalance>) =>
            setCurrentAccountTokenBalance(
              _assetBalance.isSome
                ? (_assetBalance.value as AssetAccount)
                : null
            )
        )
        .then((unsub) => {
          unsubscribe = unsub;
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e);
        });
    }

    return () => unsubscribe && unsubscribe();
  }, [
    api,
    currentDao,
    metamaskAccount,
    setCurrentAccountTokenBalance,
    substrateAccount
  ]);

  return null;
}
