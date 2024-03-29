import { useEffect, useState } from 'react';
import clsx from 'clsx';

import { useAtomValue, useSetAtom } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { currentReferendumAtom } from 'store/referendum';
import {
  councilProposalsAtom,
  democracyProposalsAtom,
  ethGovernanceProposalsAtom
} from 'store/proposals';

import { useSubscription } from '@apollo/client';

import SUBSCRIBE_LAST_REFERENDUM from 'query/subscribeLastDemocracyReferendum.graphql';

import type { SubscribeDemocracyReferendums } from 'types';

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
  const councilProposals = useAtomValue(councilProposalsAtom);
  const ethGovernanceProposals = useAtomValue(ethGovernanceProposalsAtom);
  const democracyProposals = useAtomValue(democracyProposalsAtom);
  const setCurrentReferendum = useSetAtom(currentReferendumAtom);
  const [tab, setTab] = useState<TabOption>('List');

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
      setCurrentReferendum(null);
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
          ...(councilProposals ?? []),
          ...(ethGovernanceProposals ?? []),
          ...(democracyProposals ?? [])
        ].sort((a, b) => b.blockNum - a.blockNum)
      : referendumsData?.democracyReferendums.map((referendum) => ({
          ...referendum.democracyProposal,
          status: referendum.status,
          index: referendum.index,
          __typename: referendum.__typename
        })) ?? [];

  const onTabValueChange = (value: string) => setTab(value as TabOption);

  const { governance } = currentDao?.policy || {};

  return (
    <div
      className={clsx(
        styles.container,
        !governance || governance?.__typename === 'OwnershipWeightedVoting'
          ? styles['eth-container']
          : styles['governance-container']
      )}
    >
      <div className={styles['tabs-container']}>
        <Tabs
          value={tab}
          onValueChange={onTabValueChange}
          className={styles.tabs}
        >
          <TabsList>
            {tabOptions
              .filter((tabOption) =>
                currentDao?.policy.governance?.__typename !== 'GovernanceV1'
                  ? tabOption !== 'Referendum'
                  : true
              )
              .map((tabOption) => (
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
