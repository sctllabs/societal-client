import { useEffect } from 'react';

import { useAtomValue, useSetAtom } from 'jotai';
import type { EventRecord } from '@polkadot/types/interfaces';
import type { Vec } from '@polkadot/types';

import { apiAtom } from 'store/api';
import { eventsAtom } from 'store/events';

export function PreloaderEvents() {
  const api = useAtomValue(apiAtom);
  const setEvents = useSetAtom(eventsAtom);

  useEffect(() => {
    let unsubscribe: any;

    if (!api) {
      return undefined;
    }

    api.query.system
      .events((events: Vec<EventRecord>) => setEvents(events))
      .then((unsub) => {
        unsubscribe = unsub;
      });

    return () => unsubscribe && unsubscribe();
  }, [api, setEvents]);

  return null;
}
