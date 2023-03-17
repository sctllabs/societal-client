import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import erc20Abi from 'abis/erc20.abi.json';
import { appConfig } from 'config';

import { useAtom, useAtomValue } from 'jotai';
import { tokenAtom } from 'store/token';
import { currentDaoAtom, daosAtom } from 'store/dao';
import { apiAtom } from 'store/api';

import type { AssetBalance } from '@polkadot/types/interfaces';
import type { Option } from '@polkadot/types';

import { Typography } from 'components/ui-kit/Typography';
import { Card } from 'components/ui-kit/Card';
import { Chip } from 'components/ui-kit/Chip';

import styles from './Token.module.scss';

const TOKEN_TYPE = 'Governance token';

export function Token() {
  const [token, setToken] = useAtom(tokenAtom);
  const api = useAtomValue(apiAtom);
  const daos = useAtomValue(daosAtom);
  const currentDao = useAtomValue(currentDaoAtom);

  const [tokenMetadataLoading, setTokenMetadataLoading] =
    useState<boolean>(false);

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
        setTokenMetadataLoading(true);
        const name = await contract.name();
        const symbol = await contract.symbol();
        const totalSupply = await contract.totalSupply();
        const decimals = await contract.decimals();
        setToken({
          quantity: ethers.utils.formatUnits(totalSupply, decimals),
          decimals,
          symbol,
          name
        });
        setTokenMetadataLoading(false);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    })();
  }, [currentDao, daos, setToken]);

  useEffect(() => {
    if (!api) {
      return undefined;
    }
    let unsubscribe: any | null = null;

    if (!currentDao || !currentDao.fungibleToken) {
      return undefined;
    }

    const tokenId = currentDao.fungibleToken.id;

    api.query.assets
      .account(
        tokenId,
        currentDao.account.id,
        (_assetBalance: Option<AssetBalance>) =>
          setToken({
            quantity: _assetBalance.value.balance.toString(),
            name: currentDao.fungibleToken.name,
            symbol: currentDao.fungibleToken.symbol,
            decimals: currentDao.fungibleToken.decimals
          })
      )
      .then((unsub) => {
        unsubscribe = unsub;
      });

    return () => unsubscribe && unsubscribe();
  }, [api, currentDao, daos, setToken]);

  return (
    <Card className={styles.card}>
      {tokenMetadataLoading ? (
        <Typography variant="caption2">Loading...</Typography>
      ) : (
        <>
          <div className={styles.token}>
            <Typography variant="caption2">{token?.symbol}</Typography>
            <Chip variant="group" color="active" className={styles.chip}>
              <Typography variant="title8">{TOKEN_TYPE}</Typography>
            </Chip>
          </div>

          <Typography variant="title1">
            {token.quantity &&
              Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(
                parseFloat(token.quantity)
              )}
          </Typography>
        </>
      )}
    </Card>
  );
}
