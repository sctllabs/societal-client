import { useMemo } from 'react';
import clsx from 'clsx';
import { formatDistance } from 'date-fns';

import { useAtom, useAtomValue } from 'jotai';
import {
  chainDecimalsAtom,
  chainSymbolAtom
  // currentBlockAtom
} from 'store/api';
import { tokenDecimalsAtom, tokenSymbolAtom } from 'store/token';
import { selectedDaoBountyAtom } from 'store/bounty';
import { formatBalance } from '@polkadot/util';

import type { BountyMeta } from 'types';
import { Card } from 'components/ui-kit/Card';
// import { Countdown } from 'components/Countdown';
import { Typography } from 'components/ui-kit/Typography';
import { Icon } from 'components/ui-kit/Icon';
import { Avatar } from 'components/ui-kit/Avatar';

import { BountyCardActions } from './BountyCardActions';
import styles from './BountyCard.module.scss';

export type BountyCardProps = {
  bounty: BountyMeta;
};

export function BountyCard({ bounty }: BountyCardProps) {
  // const currentBlock = useAtomValue(currentBlockAtom);
  const tokenSymbol = useAtomValue(tokenSymbolAtom);
  const currencySymbol = useAtomValue(chainSymbolAtom);
  const chainDecimals = useAtomValue(chainDecimalsAtom);
  const tokenDecimals = useAtomValue(tokenDecimalsAtom);
  const [selectedDaoBounty, setSelectedDaoBounty] = useAtom(
    selectedDaoBountyAtom
  );

  const handleSelect = (id: string | null) => {
    setSelectedDaoBounty(id);
  };

  const bountyStatus = useMemo(() => {
    switch (bounty.status) {
      case 'Created':
      case 'BecameActive':
      case 'CuratorProposed':
      case 'CuratorAccepted':
      case 'CuratorUnassigned':
      case 'Extended': {
        return 'Active';
      }
      default: {
        return 'Completed';
      }
    }
  }, [bounty.status]);

  // const countdown = useMemo(() => {
  //   if (!currentBlock) {
  //     return null;
  //   }

  //   if (bounty.status === 'Created') {
  //     return null;
  //   }

  //   return (
  //     <Countdown
  //       endBlock={
  //         bounty.blockNum + bounty.dao.policy.bountyUpdatePeriod - currentBlock
  //       }
  //       orientation="horizontal"
  //       typography="value5"
  //     />
  //   );
  // }, [
  //   bounty.blockNum,
  //   bounty.dao.policy.bountyUpdatePeriod,
  //   bounty.status,
  //   currentBlock
  // ]);

  const distance = formatDistance(new Date(bounty.createdAt), new Date());
  const { title, description } = bounty.description
    ? JSON.parse(bounty.description)
    : { title: '', description: '' };

  return (
    <div
      className={clsx(styles.bounty, {
        [styles.active]: bounty.id === selectedDaoBounty
      })}
    >
      <Card className={styles.card} onClick={() => handleSelect(bounty.id)}>
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
          {/* {countdown} */}
        </div>
        <div className={styles.content}>
          <div className={styles['title-container']}>
            <Avatar
              className={styles.logo}
              value={bounty.dao.name}
              radius="standard"
            />
            <Typography variant="title7">{bounty.dao.name}</Typography>
            <Typography variant="caption2" className={styles.distance}>
              Added {distance} ago
            </Typography>
          </div>
          <div className={styles['description-container']}>
            <Typography variant="title3">{title}</Typography>
            <Typography variant="body2">{description}</Typography>
          </div>
          <div className={styles['additional-info-container']}>
            <div className={styles.value}>
              <Typography variant="title2">
                {formatBalance(bounty.value, {
                  decimals:
                    (bounty.nativeToken ? chainDecimals : tokenDecimals) || 0,
                  withSi: false,
                  forceUnit: '-'
                })}
              </Typography>
              <Typography variant="body2">
                {bounty.nativeToken ? currencySymbol : tokenSymbol}
              </Typography>
            </div>
          </div>
        </div>
        <BountyCardActions bounty={bounty} />
      </Card>
    </div>
  );
}
