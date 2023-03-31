import { MouseEventHandler, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { accountsAtom } from 'store/account';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Chip } from 'components/ui-kit/Chip';

import { apiAtom } from 'store/api';
import { StorageKey } from '@polkadot/types';

import type { AccountDaoMember, AssetAccount } from 'types';

import styles from './Members.module.scss';

export function Members() {
  const currentDao = useAtomValue(currentDaoAtom);
  const api = useAtomValue(apiAtom);
  const accounts = useAtomValue(accountsAtom);
  const [daoMembers, setDaoMembers] = useState<AccountDaoMember[]>([]);

  useEffect(() => {
    if (!api) {
      return undefined;
    }
    let unsubscribe: any | null = null;

    const members: { [key: string]: AccountDaoMember } = {};
    currentDao?.council.forEach((account) => {
      members[account] = {
        __typename: 'AccountDaoMember',
        accountId: account,
        kind: ['Council']
      };
    });

    if (!currentDao || !currentDao.fungibleToken) {
      setDaoMembers(Object.values(members));

      return undefined;
    }

    const tokenId = currentDao.fungibleToken.id;

    // TODO: use paging here
    api.query.assets.account
      .entries(tokenId, (_assetBalances: [StorageKey, AssetAccount][]) => {
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

        setDaoMembers(Object.values(members));
      })
      .then((unsub) => {
        unsubscribe = unsub;
      });

    return () => unsubscribe && unsubscribe();
  }, [api, currentDao, setDaoMembers]);

  const handleOnClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const address = (e.target as HTMLButtonElement).getAttribute(
      'data-address'
    );
    if (!address) {
      return;
    }

    navigator.clipboard.writeText(address);
  };

  return (
    <Card className={styles.card}>
      <span className={styles.title}>
        <Typography variant="title4">Members</Typography>
      </span>

      <ul className={styles.members}>
        {daoMembers.map(({ accountId, kind }) => (
          <li className={styles.member} key={accountId}>
            <span className={styles['member-title']}>
              <Typography variant="title5">
                {(accounts?.find((_account) => _account.address === accountId)
                  ?.meta.name as string) ?? accountId}
              </Typography>
              <Button
                variant="icon"
                size="xs"
                data-address={accountId}
                onClick={handleOnClick}
              >
                <Icon name="copy" size="xs" />
              </Button>
            </span>
            {kind.includes('Council') && (
              <Chip variant="group" color="orange">
                <Typography variant="title8">Council</Typography>
              </Chip>
            )}
            {kind.includes('TokenHolder') && (
              <Chip variant="group" color="blue">
                <Typography variant="title8">Token Holder</Typography>
              </Chip>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
