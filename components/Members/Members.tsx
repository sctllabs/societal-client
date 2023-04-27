import { MouseEventHandler } from 'react';
import { useAtomValue } from 'jotai';
import { accountsAtom } from 'store/account';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Chip } from 'components/ui-kit/Chip';

import { membersAtom } from 'store/members';

import styles from './Members.module.scss';

export function Members() {
  const accounts = useAtomValue(accountsAtom);
  const daoMembers = useAtomValue(membersAtom);

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
        {daoMembers?.map(({ accountId, kind }) => (
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
