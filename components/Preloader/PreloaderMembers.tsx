import { useEffect } from 'react';
import { useRouter } from 'next/router';

import { useAtomValue, useSetAtom } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { apiAtom } from 'store/api';

import type { StorageKey } from '@polkadot/types';
import {
  membersAtom,
  membersLoadingAtom,
  resetMembersAtom
} from 'store/members';
import { AccountDaoMember, AssetAccount } from 'types';

export function PreloaderMembers() {
  const router = useRouter();
  const currentDao = useAtomValue(currentDaoAtom);
  const api = useAtomValue(apiAtom);
  const setMembers = useSetAtom(membersAtom);
  const setMembersLoading = useSetAtom(membersLoadingAtom);
  const resetMembers = useSetAtom(resetMembersAtom);

  useEffect(
    () => () => {
      resetMembers();
    },
    [resetMembers, router.query.id]
  );

  useEffect(() => {
    if (!api || !currentDao) {
      return;
    }

    const members: { [key: string]: AccountDaoMember } = {};
    currentDao?.council.forEach((account) => {
      members[account] = {
        __typename: 'AccountDaoMember',
        accountId: account,
        kind: ['Council']
      };
    });

    if (!currentDao.fungibleToken) {
      setMembers(Object.values(members));

      return;
    }

    (async () => {
      try {
        setMembersLoading(true);

        const tokenId = currentDao.fungibleToken.id;

        // TODO: use paging here
        api.query.assets.account.entries(
          tokenId,
          (_assetBalances: [StorageKey, AssetAccount][]) => {
            _assetBalances.forEach(([key, tokenBalance]) => {
              const [, accountId] = key.toHuman() as any;
              if (accountId === currentDao.account.id) {
                return;
              }

              if (!members[accountId]) {
                members[accountId] = {
                  __typename: 'AccountDaoMember',
                  accountId,
                  kind: ['TokenHolder'],
                  tokenBalance
                };

                return;
              }

              members[accountId] = {
                ...members[accountId],
                kind: ['Council', 'TokenHolder'],
                tokenBalance
              };
            });

            setMembers(Object.values(members));
          }
        );
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        setMembersLoading(false);
      }
    })();
  }, [api, currentDao, setMembers, setMembersLoading]);

  return null;
}
