import { useEffect, useState } from 'react';

import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { apiAtom } from 'store/api';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_COUNCIL_PROPOSALS_BY_DAO_ID from 'query/subscribeCouncilProposalsByDaoId.graphql';
import SUBSCRIBE_DEMOCRACY_PROPOSALS_BY_DAO_ID from 'query/subscribeDemocracyProposalsByDaoId.graphql';

import type {
  SubscribeCouncilProposalsByDaoId,
  SubscribeDemocracyProposalsByDaoId
} from 'types';
import type { u32 } from '@polkadot/types';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { ProposalCard } from 'components/ProposalCard';

import styles from './Proposals.module.scss';

export function Proposals() {
  const api = useAtomValue(apiAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);

  const { data: councilProposalsData } =
    useSubscription<SubscribeCouncilProposalsByDaoId>(
      SUBSCRIBE_COUNCIL_PROPOSALS_BY_DAO_ID,
      {
        variables: { daoId: currentDao?.id }
      }
    );

  const { data: democracyProposalsData } =
    useSubscription<SubscribeDemocracyProposalsByDaoId>(
      SUBSCRIBE_DEMOCRACY_PROPOSALS_BY_DAO_ID,
      {
        variables: { daoId: currentDao?.id }
      }
    );

  const proposals = [
    ...(councilProposalsData?.councilProposals ?? []),
    ...(democracyProposalsData?.democracyProposals ?? [])
  ].sort((a, b) => b.blockNum - a.blockNum);

  useEffect(() => {
    (async () => {
      const _currentBlock = (
        (await api?.query.system.number()) as u32 | undefined
      )?.toNumber();

      if (!_currentBlock) {
        return;
      }
      setCurrentBlock(_currentBlock);
    })();
  }, [api?.query.system]);

  return (
    <div className={styles.container}>
      <Card className={styles['proposals-title-card']}>
        <Typography variant="title4">Proposals</Typography>
      </Card>
      {proposals.length > 0 ? (
        proposals.map((proposal) => (
          <ProposalCard
            key={`${proposal.__typename}-${proposal.id}`}
            proposal={proposal}
            currentBlock={currentBlock}
          />
        ))
      ) : (
        <Card className={styles['proposals-empty-card']}>
          <Typography variant="caption2" className={styles.caption}>
            You don&apos;t have any proposals yet
          </Typography>
        </Card>
      )}
    </div>
  );
}
