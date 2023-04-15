import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useAtomValue, useSetAtom } from 'jotai';
import { apiAtom } from 'store/api';
import {
  setCouncilProposalsAtom,
  setDemocracyProposalsAtom,
  setEthGovernanceProposalsAtom
} from 'store/proposals';
import {
  pendingCouncilProposalHandler,
  pendingDemocracyProposalHandler,
  pendingEthGovernanceProposalHandler
} from 'utils/pendingProposalHandler';
import type { EventRecord } from '@polkadot/types/interfaces';
import type { Vec } from '@polkadot/types';

export function PreloaderProposalEvents() {
  const router = useRouter();
  const api = useAtomValue(apiAtom);
  const setCouncilProposals = useSetAtom(setCouncilProposalsAtom);
  const setEthGovernanceProposals = useSetAtom(setEthGovernanceProposalsAtom);
  const setDemocracyProposals = useSetAtom(setDemocracyProposalsAtom);

  useEffect(() => {
    let unsubscribe: any;

    if (!api) {
      return undefined;
    }

    const councilProposalProposedEventSignature =
      api.events.daoCouncil.Proposed;
    const ethGovernanceProposalProposedEventSignature =
      api.events.daoEthGovernance.Proposed;
    const democracyProposalProposedEventSignature =
      api.events.daoDemocracy.Proposed;

    api.query.system
      .events((events: Vec<EventRecord>) => {
        const councilProposedEvents = events.filter(
          (r) =>
            r.event &&
            councilProposalProposedEventSignature.is(r.event) &&
            (r.event.data.toHuman() as any).daoId === router.query.id
        );
        const ethGovernanceProposedEvents = events.filter(
          (r) =>
            r.event &&
            ethGovernanceProposalProposedEventSignature.is(r.event) &&
            (r.event.data.toHuman() as any).daoId === router.query.id
        );
        const democracyProposedEvents = events.filter(
          (r) =>
            r.event &&
            democracyProposalProposedEventSignature.is(r.event) &&
            (r.event.data.toHuman() as any).daoId === router.query.id
        );

        if (councilProposedEvents.length > 0) {
          setCouncilProposals(
            councilProposedEvents.map((x) => pendingCouncilProposalHandler(x))
          );
        }

        if (ethGovernanceProposedEvents.length > 0) {
          setEthGovernanceProposals(
            ethGovernanceProposedEvents.map((x) =>
              pendingEthGovernanceProposalHandler(x)
            )
          );
        }

        if (democracyProposedEvents.length > 0) {
          setDemocracyProposals(
            democracyProposedEvents.map((x) =>
              pendingDemocracyProposalHandler(x)
            )
          );
        }
      })
      .then((unsub) => {
        unsubscribe = unsub;
      });

    return () => unsubscribe && unsubscribe();
  }, [
    api,
    router.query.id,
    setCouncilProposals,
    setDemocracyProposals,
    setEthGovernanceProposals
  ]);

  return null;
}
