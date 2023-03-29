import { useRouter } from 'next/router';

import { useSetAtom } from 'jotai';
import { bountiesAtom } from 'store/bounty';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_BOUNTIES_BY_DAO_ID from 'query/subscribeBountiesByDaoId.graphql';

import type { SubscribeBountiesByDaoId } from 'types';
import { useEffect } from 'react';

export function PreloaderBounties() {
  const router = useRouter();
  const setBounties = useSetAtom(bountiesAtom);

  const { data } = useSubscription<SubscribeBountiesByDaoId>(
    SUBSCRIBE_BOUNTIES_BY_DAO_ID,
    {
      variables: { daoId: router.query.id }
    }
  );

  useEffect(() => {
    setBounties(data?.bounties);
  }, [data?.bounties, setBounties]);

  return null;
}
