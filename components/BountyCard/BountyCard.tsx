import { useMemo } from 'react';
import clsx from 'clsx';
import { formatDistance } from 'date-fns';

import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { chainSymbolAtom, currentBlockAtom } from 'store/api';
import { tokenSymbolAtom } from 'store/token';

import type { BountyMeta } from 'types';
import { Card } from 'components/ui-kit/Card';
import { Countdown } from 'components/Countdown';
import { Typography } from 'components/ui-kit/Typography';
import { Icon } from 'components/ui-kit/Icon';
import { Avatar } from 'components/ui-kit/Avatar';

import styles from './BountyCard.module.scss';

export type BountyCardProps = {
  bounty: BountyMeta;
};

export function BountyCard({ bounty }: BountyCardProps) {
  const currentDao = useAtomValue(currentDaoAtom);
  const currentBlock = useAtomValue(currentBlockAtom);
  const tokenSymbol = useAtomValue(tokenSymbolAtom);
  const currencySymbol = useAtomValue(chainSymbolAtom);

  const bountyStatus = useMemo(() => {
    switch (bounty.status) {
      case 'Created': {
        return 'Active';
      }
      case 'BecameActive': {
        return 'Active';
      }
      case 'CuratorProposed': {
        return 'Active';
      }
      default: {
        return 'Completed';
      }
    }
  }, [bounty.status]);

  const countdown = useMemo(() => {
    if (!currentDao || !currentBlock) {
      return null;
    }

    if (bounty.status === 'Created') {
      return null;
    }

    return (
      <Countdown
        endBlock={
          bounty.blockNum + currentDao.policy.bountyUpdatePeriod - currentBlock
        }
        orientation="horizontal"
        typography="value5"
      />
    );
  }, [bounty.blockNum, bounty.status, currentBlock, currentDao]);

  const distance = formatDistance(new Date(bounty.createdAt), new Date());
  const { title, description } = bounty.description
    ? JSON.parse(bounty.description)
    : { title: '', description: '' };

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles['status-container']}>
          <Icon
            name="circle"
            className={clsx(
              styles['status-icon'],
              styles[
                bountyStatus === 'Active' ? 'icon-active' : 'icon-completed'
              ]
            )}
          />
          <Typography variant="title7">{bountyStatus}</Typography>
        </div>
        {countdown}
      </div>

      <div className={styles.content}>
        <div className={styles['title-container']}>
          {currentDao && (
            <Avatar
              className={styles.logo}
              value={currentDao.name}
              radius="standard"
            />
          )}
          <Typography variant="title7">{currentDao?.name}</Typography>
          <Typography variant="caption2" className={styles.distance}>
            Added {distance} ago
          </Typography>
        </div>
        <div className={styles['description-container']}>
          <Typography variant="title3">{title}</Typography>
          <Typography variant="body2">{description}</Typography>
        </div>
        <div className={styles['actions-container']}>
          <Typography className={styles.value} variant="title2">
            {bounty.value} {bounty.nativeToken ? currencySymbol : tokenSymbol}
          </Typography>
        </div>
      </div>
    </Card>
  );
}
