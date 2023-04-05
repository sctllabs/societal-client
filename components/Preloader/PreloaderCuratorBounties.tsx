import { useEffect, useMemo } from 'react';

import { useAtomValue, useSetAtom } from 'jotai';
import { metamaskAccountAtom, substrateAccountAtom } from 'store/account';
import { curatorBountiesAtom } from 'store/bounty';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_BOUNTIES_BY_CURATOR_ID from 'query/subscribeBountiesByCuratorId.graphql';

import type { SubscribeBountiesByCuratorId } from 'types';

export function PreloaderCuratorBounties() {
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const setCuratorBounties = useSetAtom(curatorBountiesAtom);

  const accountId = useMemo(() => {
    if (metamaskAccount?._address) {
      return metamaskAccount._address;
    }
    if (substrateAccount) {
      return substrateAccount.address;
    }
    return null;
  }, [metamaskAccount, substrateAccount]);

  const { data } = useSubscription<SubscribeBountiesByCuratorId>(
    SUBSCRIBE_BOUNTIES_BY_CURATOR_ID,
    {
      variables: { curatorId: accountId, beneficiaryId: accountId }
    }
  );

  useEffect(() => {
    setCuratorBounties(data?.bounties || null);
  }, [data?.bounties, setCuratorBounties]);

  return null;
}
