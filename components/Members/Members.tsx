import { MouseEventHandler } from 'react';
import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Chip } from 'components/ui-kit/Chip';

import styles from './Members.module.scss';

export function Members() {
  const currentDao = useAtomValue(currentDaoAtom);

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
        {currentDao?.council.map((councilAddress) => (
          <li className={styles.member} key={councilAddress}>
            <span className={styles['member-title']}>
              <Typography variant="title5">{councilAddress}</Typography>
              <Button
                variant="icon"
                size="xs"
                data-address={councilAddress}
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
