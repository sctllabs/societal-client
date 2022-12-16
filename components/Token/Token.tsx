import { useEffect, useState } from 'react';

import { useAtomValue } from 'jotai';
import { daosAtom } from 'store/dao';
import { apiAtom } from 'store/api';

import { Typography } from 'components/ui-kit/Typography';
import { Card } from 'components/ui-kit/Card';
import { Chip } from 'components/ui-kit/Chip';

import type { AssetBalance, AssetMetadata } from '@polkadot/types/interfaces';
import type { Option } from '@polkadot/types';
import type { DaoToken } from 'types';

import styles from './Token.module.scss';

export interface TokenProps {
  daoId: string;
}

const TOKEN_TYPE = 'Governance token';

export function Token({ daoId }: TokenProps) {
  const [token, setToken] = useState<DaoToken | null>(null);
  const [tokenQuantity, setTokenQuantity] = useState<string | null>(null);
  const api = useAtomValue(apiAtom);
  const daos = useAtomValue(daosAtom);

  useEffect(() => {
    if (!api || !daos) {
      return undefined;
    }
    let unsubscribe: any | null = null;

    const currentDao = daos?.find((x) => x.id === daoId);
    if (!currentDao) {
      return undefined;
    }

    api.query.assets
      .account(
        currentDao.dao.tokenId,
        currentDao.dao.accountId,
        (x: Option<AssetBalance>) =>
          setTokenQuantity(x.value.balance.toString())
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

  useEffect(() => {
    if (!api || !daos) {
      return undefined;
    }
    let unsubscribe: any | null = null;

    const currentDao = daos?.find((x) => x.id === daoId);
    if (!currentDao) {
      return undefined;
    }

    api.query.assets
      .metadata(
        currentDao.dao.tokenId,
        ({ name, symbol, decimals }: AssetMetadata) =>
          setToken({
            name: name.toHuman() as string,
            symbol: symbol.toHuman() as string,
            decimals: decimals.toNumber()
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
      <div className={styles.token}>
        <Typography variant="caption2">{token?.symbol}</Typography>
        <Chip variant="group" color="active" className={styles.chip}>
          <Typography variant="title8">{TOKEN_TYPE}</Typography>
        </Chip>
      </div>

      <Typography variant="title1">
        {tokenQuantity &&
          Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(
            parseFloat(tokenQuantity)
          )}
      </Typography>
    </Card>
  );
}
