import { useEffect } from 'react';

import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import type { EventRecord } from '@polkadot/types/interfaces';
import type { Vec } from '@polkadot/types';

export function PreloaderProposalEvents() {
  const api = useAtomValue(apiAtom);

  useEffect(() => {
    let unsubscribe: any;

    api?.query.system
      .events((events: Vec<EventRecord>) => {
        const proposedEventSignature = api?.events.daoCouncil.Proposed;

        const proposedEvents = events.filter(
          (r) => r.event && proposedEventSignature.is(r.event)
        );

        console.log(proposedEvents.map((x) => x.toHuman()));
      })
      .then((unsub) => {
        unsubscribe = unsub;
      });

    return () => unsubscribe && unsubscribe();
  }, [api?.events.daoCouncil.Proposed, api?.query.system]);

  return null;
}
