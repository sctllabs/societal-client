import { useEffect, useState } from 'react';

import { useAtomValue } from 'jotai';
import { daosAtom } from 'store/dao';
import { apiAtom } from 'store/api';

import type { AccountInfo } from '@polkadot/types/interfaces';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';

import styles from './Balance.module.scss';

export interface BalanceProps {
  daoId: string;
}

const CURRENCY = '$SCTL';

export function Balance({ daoId }: BalanceProps) {
  const [balance, setBalance] = useState<string | null>(null);
  const api = useAtomValue(apiAtom);
  const daos = useAtomValue(daosAtom);

  useEffect(() => {
    let unsubscribe: any | null = null;

    const currentDao = daos?.find((x) => x.id === daoId);

    if (!currentDao) {
      return undefined;
    }

    api?.query.system
      .account(currentDao.dao.accountId, ({ data: { free } }: AccountInfo) =>
        setBalance(free.toString())
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
      <Typography variant="caption2">Balance of all assets</Typography>
      <div className={styles.balance}>
        <Typography variant="title1">
          {balance &&
            Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(
              parseFloat(balance)
            )}
        </Typography>
        <Typography variant="title2">{CURRENCY}</Typography>
      </div>
    </Card>
  );
}
