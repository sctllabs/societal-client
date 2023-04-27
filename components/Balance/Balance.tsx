import { useEffect, useState } from 'react';

import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { apiAtom, chainDecimalsAtom, chainSymbolAtom } from 'store/api';

import { formatBalance } from '@polkadot/util';

import type { AccountInfo } from '@polkadot/types/interfaces';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';

import styles from './Balance.module.scss';

export function Balance() {
  const api = useAtomValue(apiAtom);
  const currency = useAtomValue(chainSymbolAtom);
  const decimals = useAtomValue(chainDecimalsAtom);
  const [balance, setBalance] = useState<string | null>(null);

  const currentDao = useAtomValue(currentDaoAtom);

  useEffect(() => {
    let unsubscribe: any;

    if (!currentDao) {
      return undefined;
    }

    api?.query.system
      .account(currentDao.account.id, ({ data: { free } }: AccountInfo) =>
        setBalance(free.toString())
      )
      .then((unsub) => {
        unsubscribe = unsub;
      })
      // eslint-disable-next-line no-console
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api, currentDao]);

  return (
    <Card className={styles.card}>
      <Typography variant="caption2">Balance</Typography>
      <div className={styles.balance}>
        {balance !== null && (
          <Typography variant="title1">
            {formatBalance(balance, {
              decimals: decimals || 0,
              withSi: false,
              forceUnit: '-'
            })}
          </Typography>
        )}
        <Typography variant="title2">{currency}</Typography>
      </div>
    </Card>
  );
}
