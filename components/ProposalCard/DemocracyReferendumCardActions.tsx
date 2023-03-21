import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';

import type { ReferendumInfo } from '@polkadot/types/interfaces';
import type { Option } from '@polkadot/types';
import type { DemocracyReferendumMeta } from 'types';

import { Typography } from 'components/ui-kit/Typography';
import { Icon } from 'components/ui-kit/Icon';

import { DemocracyReferendumVoteModal } from './DemocracyReferendumVoteModal';
import styles from './ProposalCard.module.scss';
import { DemocracyReferendumRevokeVote } from './DemocracyReferendumRevokeVote';

type DemocracyReferendumCardActionsProps = {
  proposal: DemocracyReferendumMeta;
};

export function DemocracyReferendumCardActions({
  proposal
}: DemocracyReferendumCardActionsProps) {
  const api = useAtomValue(apiAtom);
  const [referendumInfo, setReferendumInfo] = useState<ReferendumInfo | null>(
    null
  );

  useEffect(() => {
    let unsubscribe: any;

    api?.query.daoDemocracy
      .referendumInfoOf(
        proposal.dao.id,
        proposal.index,
        (_referendumInfo: Option<ReferendumInfo>) =>
          setReferendumInfo(_referendumInfo.value)
      )
      .then((unsub) => {
        unsubscribe = unsub;
      });

    return () => unsubscribe && unsubscribe();
  }, [api, proposal]);

  const ayes = referendumInfo?.isOngoing
    ? referendumInfo?.asOngoing.tally.ayes.toNumber()
    : 0;
  const nays = referendumInfo?.isOngoing
    ? referendumInfo?.asOngoing.tally.nays.toNumber()
    : 0;

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
    <div className={styles['democracy-referendum-actions']}>
      {referendumInfo?.isOngoing && (
        <>
          <div className={styles['referendum-vote-container']}>
            <Typography variant="caption2">Votes</Typography>
            <div className={styles['votes-container']}>
              <Icon
                className={styles['vote-no-icon']}
                name="vote-no"
                size="sm"
              />
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
              <Icon
                className={styles['vote-yes-icon']}
                name="vote-yes"
                size="sm"
              />
            </div>
          </div>

          <DemocracyReferendumVoteModal proposal={proposal} />
        </>
      )}
      {referendumInfo?.isFinished && (
        <>
          <DemocracyReferendumRevokeVote proposal={proposal} />
          <div
            className={clsx(
              styles['referendum-status'],
              styles[
                referendumInfo.asFinished.approved.toPrimitive()
                  ? 'approved'
                  : 'failed'
              ]
            )}
          >
            <Typography variant="button1">
              {referendumInfo.asFinished.approved.toPrimitive()
                ? 'Approved'
                : 'Failed'}
            </Typography>
          </div>
        </>
      )}
    </div>
  );
}
