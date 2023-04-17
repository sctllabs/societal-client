import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import erc20Abi from 'abis/erc20.abi.json';
import { appConfig } from 'config';

import { useAtomValue, useSetAtom } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { apiAtom } from 'store/api';
import {
  resetTokenAtom,
  tokenAtom,
  tokenLoadingAtom,
  tokenQuantityAtom
} from 'store/token';

import type { AssetBalance } from '@polkadot/types/interfaces';
import type { Option } from '@polkadot/types';

export function PreloaderToken() {
  const router = useRouter();
  const currentDao = useAtomValue(currentDaoAtom);
  const api = useAtomValue(apiAtom);
  const setToken = useSetAtom(tokenAtom);
  const setTokenLoading = useSetAtom(tokenLoadingAtom);
  const setTokenQuantity = useSetAtom(tokenQuantityAtom);
  const resetToken = useSetAtom(resetTokenAtom);

  useEffect(
    () => () => {
      resetToken();
    },
    [resetToken, router.query.id]
  );

  useEffect(() => {
    if (!currentDao) {
      return;
    }

    if (!currentDao.ethTokenAddress) {
      return;
    }

    const provider = new ethers.providers.InfuraProvider(
      appConfig.tokenNetwork,
      appConfig.tokenApiKey
    );

    const contract = new ethers.Contract(
      currentDao.ethTokenAddress,
      erc20Abi,
      provider
    );

    (async () => {
      try {
        setTokenLoading(true);
        const [name, symbol, totalSupply, decimals] = await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.totalSupply(),
          contract.decimals()
        ]);

        setToken({
          quantity: ethers.utils.formatUnits(totalSupply, decimals),
          decimals,
          symbol,
          name
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        setTokenLoading(false);
      }
    })();
  }, [currentDao, setToken, setTokenLoading]);

  useEffect(() => {
    if (!api || !currentDao || !currentDao.fungibleToken) {
      return;
    }

    (async () => {
      const _assetBalance = await api.query.assets.account<
        Option<AssetBalance>
      >(currentDao.fungibleToken.id, currentDao.account.id);
      setToken({
        quantity: _assetBalance.value.balance.toString(),
        name: currentDao.fungibleToken.name,
        symbol: currentDao.fungibleToken.symbol,
        decimals: currentDao.fungibleToken.decimals
      });
    })();
  }, [api, currentDao, setToken]);

  useEffect(() => {
    if (!api) {
      return undefined;
    }
    let unsubscribe: any | null = null;

    if (!currentDao || !currentDao.fungibleToken) {
      return undefined;
    }

    api.query.assets
      .account(
        currentDao.fungibleToken.id,
        currentDao.account.id,
        (_assetBalance: Option<AssetBalance>) =>
          setTokenQuantity(_assetBalance.value.balance.toString())
      )
      .then((unsub) => {
        unsubscribe = unsub;
      })
      // eslint-disable-next-line no-console
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api, currentDao, setToken]);

  return null;
}
