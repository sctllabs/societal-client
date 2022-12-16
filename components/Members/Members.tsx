import { MouseEventHandler, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { apiAtom, keyringAtom } from 'store/api';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Chip } from 'components/ui-kit/Chip';

import type { MemberMeta } from 'types';

import styles from './Members.module.scss';

export interface MembersProps {
  daoId: string;
}

export function Members({ daoId }: MembersProps) {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [members, setMembers] = useState<MemberMeta[]>([]);
  const api = useAtomValue(apiAtom);
  const keyring = useAtomValue(keyringAtom);

  useEffect(() => {
    if (!api) {
      return undefined;
    }

    let unsubscribe: any | null = null;

    api.query.daoCouncil
      .members(daoId)
      .then((x) => setAddresses(x.toHuman() as string[]))
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
  }, [api, daoId]);

  const handleOnClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const address = (e.target as HTMLButtonElement).getAttribute(
      'data-address'
    );
    if (!address) {
      return;
    }

    navigator.clipboard.writeText(address);
  };

  useEffect(() => {
    if (!keyring) {
      return;
    }
    const accounts = keyring.getPairs();
    setMembers(
      addresses.map((x) => ({
        address: x,
        name:
          (accounts.find((account) => account.address === x)?.meta
            ?.name as string) || ''
      }))
    );
  }, [addresses, keyring]);

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
