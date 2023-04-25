import Link from 'next/link';
import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';

import { getLinkIcon } from 'utils/getLinkIcon';
import { getFieldFromMetadata } from 'utils/getFieldFromMetadata';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Icon } from 'components/ui-kit/Icon';

import styles from './About.module.scss';

export function About() {
  const currentDao = useAtomValue(currentDaoAtom);

  if (!currentDao) {
    return null;
  }

  const { purpose } = currentDao;

  const links = getFieldFromMetadata(currentDao.metadata, 'links');

  return (
    <Card className={styles.card}>
      <div className={styles.info}>
        <Typography variant="title4">About</Typography>
        <Typography variant="body2">{purpose}</Typography>
      </div>
      {links && (
        <div className={styles.info}>
          <Typography variant="title4">Links</Typography>
          <div className={styles.links}>
            {links.map((link: string) => (
              <Link
                target="_blank"
                className={styles.link}
                href={link}
                key={link}
              >
                <Icon color="black" name={getLinkIcon(link)} size="xs" />
                <Typography variant="body2">{link}</Typography>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
