import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSetAtom } from 'jotai';
import {
  councilProposalsAtom,
  democracyProposalsAtom,
  ethGovernanceProposalsAtom
} from 'store/proposals';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_COUNCIL_PROPOSALS_BY_DAO_ID from 'query/subscribeCouncilProposalsByDaoId.graphql';
import SUBSCRIBE_ETH_GOVERNANCE_PROPOSALS_BY_DAO_ID from 'query/subscribeEthGovernanceProposalsByDaoId.graphql';
import SUBSCRIBE_DEMOCRACY_PROPOSALS_BY_DAO_ID from 'query/subscribeDemocracyProposalsByDaoId.graphql';
import type {
  SubscribeCouncilProposalsByDaoId,
  SubscribeDemocracyProposalsByDaoId,
  SubscribeEthGovernanceProposalsByDaoId
} from 'types';

export function PreloaderProposals() {
  const router = useRouter();
  const setCouncilProposals = useSetAtom(councilProposalsAtom);
  const setEthGovernanceProposals = useSetAtom(ethGovernanceProposalsAtom);
  const setDemocracyProposalsData = useSetAtom(democracyProposalsAtom);

  const { data: councilProposalsData, loading: councilProposalsLoading } =
    useSubscription<SubscribeCouncilProposalsByDaoId>(
      SUBSCRIBE_COUNCIL_PROPOSALS_BY_DAO_ID,
      {
        variables: { daoId: router.query.id }
      }
    );

  const { data: ethGovernanceProposalsData, loading: ethGovernanceLoading } =
    useSubscription<SubscribeEthGovernanceProposalsByDaoId>(
      SUBSCRIBE_ETH_GOVERNANCE_PROPOSALS_BY_DAO_ID,
      {
        variables: { daoId: router.query.id }
      }
    );

  const { data: democracyProposalsData, loading: democracyProposalsLoading } =
    useSubscription<SubscribeDemocracyProposalsByDaoId>(
      SUBSCRIBE_DEMOCRACY_PROPOSALS_BY_DAO_ID,
      {
        variables: { daoId: router.query.id }
      }
    );

  useEffect(() => {
    if (councilProposalsLoading) {
      return;
    }

    setCouncilProposals(councilProposalsData?.councilProposals);
  }, [councilProposalsData, councilProposalsLoading, setCouncilProposals]);

  useEffect(() => {
    if (ethGovernanceLoading) {
      return;
    }

    setEthGovernanceProposals(
      ethGovernanceProposalsData?.ethGovernanceProposals
    );
  }, [
    ethGovernanceLoading,
    ethGovernanceProposalsData,
    setEthGovernanceProposals
  ]);

  useEffect(() => {
    if (democracyProposalsLoading) {
      return;
    }

    setDemocracyProposalsData(democracyProposalsData?.democracyProposals);
  }, [
    democracyProposalsData,
    democracyProposalsLoading,
    setDemocracyProposalsData
  ]);

  return null;
}
