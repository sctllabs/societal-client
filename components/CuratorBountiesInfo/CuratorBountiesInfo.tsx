import { useAtomValue } from 'jotai';
import { curatorBountiesAtom, selectedCuratorBountyAtom } from 'store/bounty';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';

import styles from './CuratorBountiesInfo.module.scss';

export function CuratorBountiesInfo() {
  const curatorBounties = useAtomValue(curatorBountiesAtom);
  const selectedCuratorBounty = useAtomValue(selectedCuratorBountyAtom);

  const count = curatorBounties?.filter((x) => x.status === 'Claimed').length;

  if (selectedCuratorBounty) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Card className={styles['title-card']}>
        <Typography variant="title2">Tasks Information</Typography>
      </Card>
      <Card className={styles['completed-card']}>
        <div className={styles['completed-title-container']}>
          <Typography variant="label1">Completed</Typography>
          <Typography variant="value3">{count}</Typography>
        </div>
      </Card>
    </div>
  );
}
