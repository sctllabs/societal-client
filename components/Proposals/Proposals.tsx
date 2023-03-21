import { useEffect, useState } from 'react';

import { useAtomValue, useSetAtom } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { currentBlockAtom } from 'store/api';
import { currentReferendumAtom } from 'store/referendum';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_COUNCIL_PROPOSALS_BY_DAO_ID from 'query/subscribeCouncilProposalsByDaoId.graphql';
import SUBSCRIBE_DEMOCRACY_PROPOSALS_BY_DAO_ID from 'query/subscribeDemocracyProposalsByDaoId.graphql';
import SUBSCRIBE_LAST_REFERENDUM from 'query/subscribeLastDemocracyReferendum.graphql';

import type {
  CouncilProposalStatus,
  SubscribeCouncilProposalsByDaoId,
  SubscribeDemocracyProposalsByDaoId,
  SubscribeDemocracyReferendums
} from 'types';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { ProposalCard } from 'components/ProposalCard';
import { Tabs, TabsList, TabsTrigger } from 'components/ui-kit/Tabs';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';

import styles from './Proposals.module.scss';

type TabOption = 'List' | 'Referendum';
const tabOptions: TabOption[] = ['List', 'Referendum'];

export function Proposals() {
  const currentDao = useAtomValue(currentDaoAtom);
  const currentBlock = useAtomValue(currentBlockAtom);
  const setCurrentReferendum = useSetAtom(currentReferendumAtom);
  const [tab, setTab] = useState<TabOption>('List');

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

  const { data: referendumsData } =
    useSubscription<SubscribeDemocracyReferendums>(SUBSCRIBE_LAST_REFERENDUM, {
      variables: { daoId: currentDao?.id }
    });

  useEffect(() => {
    if (!referendumsData?.democracyReferendums) {
      return;
    }

    const ongoingReferendum = referendumsData.democracyReferendums.find(
      (x) => x.status === 'Started'
    );

    if (!ongoingReferendum) {
      return;
    }

    setCurrentReferendum({
      ...ongoingReferendum.democracyProposal,
      status: ongoingReferendum.status,
      index: ongoingReferendum.index,
      __typename: ongoingReferendum.__typename
    });
  }, [referendumsData, setCurrentReferendum]);

  const proposals =
    tab === 'List'
      ? [
          ...(councilProposalsData?.councilProposals.map((x) => {
            if (
              currentDao &&
              currentBlock &&
              x.blockNum + currentDao.policy.proposalPeriod < currentBlock
            ) {
              return {
                ...x,
                status: 'Expired' as CouncilProposalStatus
              };
            }
            return x;
          }) ?? []),
          ...(democracyProposalsData?.democracyProposals ?? [])
        ].sort((a, b) => b.blockNum - a.blockNum)
      : referendumsData?.democracyReferendums.map((referendum) => ({
          ...referendum.democracyProposal,
          status: referendum.status,
          index: referendum.index,
          __typename: referendum.__typename
        })) ?? [];

  const onTabValueChange = (value: string) => setTab(value as TabOption);

  return (
    <div className={styles.container}>
      <div className={styles['tabs-container']}>
        <Tabs
          value={tab}
          onValueChange={onTabValueChange}
          className={styles.tabs}
        >
          <TabsList>
            {tabOptions.map((tabOption) => (
              <TabsTrigger value={tabOption} key={tabOption} asChild>
                <Typography variant="title2">{tabOption}</Typography>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button variant="text" className={styles['history-button']} disabled>
          <Typography variant="button1">History</Typography>
          <Icon name="history" size="sm" />
        </Button>
      </div>

      {proposals.length > 0 ? (
        proposals.map((proposal) => (
          <ProposalCard
            key={`${proposal.__typename}-${proposal.id}`}
            proposal={proposal}
          />
        ))
      ) : (
        <Card className={styles['proposals-empty-card']}>
          <Typography variant="caption2" className={styles.caption}>
            You don&apos;t have any&nbsp;
            {tab === 'Referendum' ? 'referendums' : 'proposals'} yet
          </Typography>
        </Card>
      )}
    </div>
  );
}
