import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAtomValue, useSetAtom } from 'jotai';

import type { StorageKey } from '@polkadot/types';
import { Voting } from '@polkadot/types/interfaces';
import { evmToAddress } from '@polkadot/util-crypto';

import { metamaskAccountAtom, substrateAccountAtom } from 'store/account';
import { apiAtom } from 'store/api';
import { currentDaoAtom } from 'store/dao';
import {
  delegationsAtom,
  delegationsLoadingAtom,
  resetDelegationsAtom
} from 'store/delegations';
import { Conviction } from 'types';

export function PreloaderDelegations() {
  const router = useRouter();
  const currentDao = useAtomValue(currentDaoAtom);
  const api = useAtomValue(apiAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const setDelegations = useSetAtom(delegationsAtom);
  const setDelegationsLoading = useSetAtom(delegationsLoadingAtom);
  const resetDelegations = useSetAtom(resetDelegationsAtom);

  useEffect(
    () => () => {
      resetDelegations();
    },
    [resetDelegations, router.query.id, substrateAccount, metamaskAccount]
  );

  useEffect(() => {
    if (!api || !currentDao) {
      return;
    }

    let currentAccountId: string | undefined;

    if (!substrateAccount && !metamaskAccount) {
      return;
    }

    if (substrateAccount) {
      currentAccountId = substrateAccount.address;
    }

    if (metamaskAccount?._address) {
      currentAccountId = evmToAddress(metamaskAccount._address);
    }

    if (!currentDao || !currentAccountId) {
      return;
    }

    (async () => {
      try {
        setDelegationsLoading(true);

        // TODO: use paging here
        api?.query.daoDemocracy.votingOf.entries(
          currentDao?.id,
          (votingOf: [StorageKey, Voting][]) => {
            setDelegations(
              votingOf
                .filter(([key, voting]) => {
                  if (!voting.isDelegating) {
                    return false;
                  }

                  const [, accountId] = key.toHuman() as any;
                  const { target } = voting.asDelegating;

                  return (
                    accountId === currentAccountId ||
                    target.toString() === currentAccountId
                  );
                })
                .map(([key, voting]) => {
                  const [, accountId] = key.toHuman() as any;
                  const { target, balance, conviction } = voting.asDelegating;

                  return {
                    source: accountId as string,
                    target: target.toString(),
                    balance: balance.toString(),
                    conviction: conviction.toString() as Conviction
                  };
                })
            );
          }
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        setDelegationsLoading(false);
      }
    })();
  }, [
    api,
    currentDao,
    setDelegations,
    setDelegationsLoading,
    substrateAccount,
    metamaskAccount
  ]);

  return null;
}
