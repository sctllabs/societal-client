import Link from 'next/link';

import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';

import styles from './Overview.module.scss';

export function Overview() {
  return (
    <div className={styles.container}>
      <Typography variant="h3" className={styles.title}>
        Welcome to Society 3.0!
      </Typography>
      <Typography variant="body1" className={styles.subtitle}>
        You don&apos;t have active DAO yet
      </Typography>
      <Link href="/create-dao">
        <Button>Create New DAO</Button>
      </Link>
    </div>
  );
}
