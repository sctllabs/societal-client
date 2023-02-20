import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import erc20Abi from 'abis/erc20.abi.json';
import { appConfig } from 'config';

import { useAtomValue } from 'jotai';
import { daosAtom } from 'store/dao';
import { apiAtom } from 'store/api';

import type { AssetBalance, AssetMetadata } from '@polkadot/types/interfaces';
import type { Option } from '@polkadot/types';
import type { DaoToken } from 'types';

import { Typography } from 'components/ui-kit/Typography';
import { Card } from 'components/ui-kit/Card';
import { Chip } from 'components/ui-kit/Chip';

import styles from './Token.module.scss';

export interface TokenProps {
  daoId: string;
}

const TOKEN_TYPE = 'Governance token';

export function Token({ daoId }: TokenProps) {
  const [token, setToken] = useState<DaoToken | null>(null);
  const api = useAtomValue(apiAtom);
  const daos = useAtomValue(daosAtom);

  const [tokenMetadataLoading, setTokenMetadataLoading] =
    useState<boolean>(false);

  useEffect(() => {
    const currentDao = daos?.find((x) => x.id === daoId);
    if (!currentDao) {
      return;
    }

    if (!currentDao.dao.token.EthTokenAddress) {
      return;
    }

    const provider = new ethers.providers.InfuraProvider(
      appConfig.tokenNetwork,
      appConfig.tokenApiKey
    );

    const contract = new ethers.Contract(
      currentDao.dao.token.EthTokenAddress,
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
  }, [daoId, daos]);

  useEffect(() => {
    if (!api) {
      return undefined;
    }
    let unsubscribe: any | null = null;

    const currentDao = daos?.find((x) => x.id === daoId);
    if (!currentDao) {
      return undefined;
    }

    if (currentDao.dao.token.EthTokenAddress) {
      // TODO: handle ETH Token Address

      return undefined;
    }

    const tokenId = currentDao.dao.token.FungibleToken;

    api
      .queryMulti<[Option<AssetBalance>, AssetMetadata]>(
        [
          [api.query.assets.account, [tokenId, currentDao.dao.accountId]],
          [api.query.assets.metadata, tokenId]
        ],
        ([_assetBalance, _assetMetadata]) =>
          setToken({
            quantity: _assetBalance.value.balance.toString(),
            name: _assetMetadata.name.toHuman() as string,
            symbol: _assetMetadata.symbol.toHuman() as string,
            decimals: _assetMetadata.decimals.toNumber()
          })
      )
      .then((unsub) => {
        unsubscribe = unsub;
      })
      // eslint-disable-next-line no-console
      .catch(console.error);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [api, daoId, daos]);

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
            {token &&
              Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(
                parseFloat(token.quantity)
              )}
          </Typography>
        </>
      )}
    </Card>
  );
}
