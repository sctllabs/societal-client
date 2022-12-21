import { MouseEventHandler, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import { accountsAtom } from 'store/account';

import type { MemberMeta } from 'types';
import type { Vec } from '@polkadot/types';
import type { AccountId } from '@polkadot/types/interfaces';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Chip } from 'components/ui-kit/Chip';

import styles from './Members.module.scss';

export interface MembersProps {
  daoId: string;
}

export function Members({ daoId }: MembersProps) {
  const [members, setMembers] = useState<MemberMeta[]>([]);
  const api = useAtomValue(apiAtom);
  const accounts = useAtomValue(accountsAtom);

  useEffect(() => {
    let unsubscribe: any | null = null;

    api?.query.daoCouncil
      .members(daoId, (_members: Vec<AccountId>) =>
        setMembers(
          _members.map((_member) => ({
            address: _member.toString(),
            name:
              accounts
                ?.find((account) => account.address === _member.toString())
                ?.meta?.name?.toString() || ''
          }))
        )
      )
      .then((unsub) => {
        unsubscribe = unsub;
      })
      // eslint-disable-next-line no-console
      .catch(console.error);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [accounts, api, daoId]);

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
        {members.map((x) => (
          <li className={styles.member} key={x.address}>
            <span className={styles['member-title']}>
              <Typography variant="title5">{x.name || x.address}</Typography>
              <Button
                variant="icon"
                size="xs"
                data-address={x}
                onClick={handleOnClick}
              >
                <Icon name="copy" size="xs" />
              </Button>
            </span>
            <Chip variant="group" color="orange">
              <Typography variant="title8">Council</Typography>
            </Chip>
          </li>
        ))}
      </ul>
    </Card>
  );
}
