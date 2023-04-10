import { useMemo } from 'react';

import { Typography } from 'components/ui-kit/Typography';
import { Icon } from 'components/ui-kit/Icon';

import styles from './ProposalCard.module.scss';

type VoteProgressProps = {
  ayes: number;
  nays: number;
};

export function VoteProgress({ ayes, nays }: VoteProgressProps) {
  const [ayesPercentage, naysPercentage] = useMemo(() => {
    let _ayesPercentage = (ayes / (ayes + nays)) * 100;
    let _naysPercentage = (nays / (ayes + nays)) * 100;

    if (Number.isNaN(_ayesPercentage)) {
      _ayesPercentage = 50;
    }
    if (Number.isNaN(_naysPercentage)) {
      _naysPercentage = 50;
    }
    return [_ayesPercentage, _naysPercentage];
  }, [ayes, nays]);

  return (
    <div className={styles['referendum-vote-container']}>
      <Typography variant="caption2">Votes</Typography>
      <div className={styles['votes-container']}>
        <Icon className={styles['vote-no-icon']} name="vote-no" size="sm" />
        <span
          style={{ left: `${naysPercentage / 2}%` }}
          className={styles.percentage}
        >
          <Typography variant="value5">{nays}</Typography>
          <Typography variant="caption2">
            {naysPercentage.toFixed(0)}%
          </Typography>
        </span>
        <span className={styles['line-background']}>
          <span
            style={{ maxWidth: `${naysPercentage}%` }}
            className={styles.line}
          />
        </span>
        <span
          style={{ right: `${(100 - naysPercentage) / 2}%` }}
          className={styles.percentage}
        >
          <Typography variant="value5">{ayes}</Typography>
          <Typography variant="caption2">
            {ayesPercentage.toFixed(0)}%
          </Typography>
        </span>
        <Icon className={styles['vote-yes-icon']} name="vote-yes" size="sm" />
      </div>
    </div>
  );
}
