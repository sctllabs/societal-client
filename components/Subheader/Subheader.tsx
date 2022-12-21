import { useRouter } from 'next/router';

import { useAtomValue } from 'jotai';
import { daosAtom } from 'store/dao';

import { Typography } from 'components/ui-kit/Typography';
import { Icon } from 'components/ui-kit/Icon';
import { Link } from 'components/Link';
import { Avatar } from 'components/ui-kit/Avatar';

import styles from './Subheader.module.scss';

export function Subheader() {
  const router = useRouter();
  const { id: daoId } = router.query;

  const daos = useAtomValue(daosAtom);
  const currentDAO = daos?.find((x) => x.id === daoId);

  if (!daoId || !currentDAO) {
    return null;
  }

  return (
    <div className={styles.root}>
      <div className={styles['left-container']}>
        <span className={styles.logo}>
          <Avatar value={currentDAO.dao.config.name} />
        </span>
        <Typography variant="title2">{currentDAO.dao.config.name}</Typography>
      </div>
      <div className={styles['right-container']}>
        {router.pathname.includes('create-proposal') ? null : (
          <Link href={`/daos/${daoId}/create-proposal`} variant="filled">
            <span className={styles['button-content']}>
              <Icon name="proposals-add" />
              <Typography variant="button1">Create Proposal</Typography>
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
