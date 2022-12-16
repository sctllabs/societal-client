import { useAtomValue } from 'jotai';
import { daosAtom } from 'store/dao';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';

import styles from './About.module.scss';

interface AboutProps {
  daoId: string;
}

export function About({ daoId }: AboutProps) {
  const daos = useAtomValue(daosAtom);

  const currentDao = daos?.find((x) => x.id === daoId);

  if (!currentDao) {
    return null;
  }

  const { purpose } = currentDao.dao.config;

  return (
    <Card className={styles.card}>
      <div className={styles.info}>
        <Typography variant="title4">About DAO</Typography>
        <Typography variant="body2">{purpose}</Typography>
      </div>
    </Card>
  );
}
