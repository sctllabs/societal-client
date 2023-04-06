import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';

import styles from './About.module.scss';

export function About() {
  const currentDao = useAtomValue(currentDaoAtom);

  if (!currentDao) {
    return null;
  }

  const { purpose } = currentDao;

  return (
    <Card className={styles.card}>
      <div className={styles.info}>
        <Typography variant="title4">About</Typography>
        <Typography variant="body2">{purpose}</Typography>
      </div>
    </Card>
  );
}
