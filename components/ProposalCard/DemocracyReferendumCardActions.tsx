import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';

import type { ReferendumInfo } from '@polkadot/types/interfaces';
import type { Option } from '@polkadot/types';
import type { DemocracyReferendumMeta } from 'types';

import { Typography } from 'components/ui-kit/Typography';

import { DemocracyReferendumVoteModal } from './DemocracyReferendumVoteModal';
import styles from './ProposalCard.module.scss';
import { DemocracyReferendumRevokeVote } from './DemocracyReferendumRevokeVote';
import { VoteProgress } from './VoteProgress';

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

  return (
    <div className={styles['democracy-referendum-actions']}>
      {referendumInfo?.isOngoing && (
        <>
          <VoteProgress ayes={ayes} nays={nays} />
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
