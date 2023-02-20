import { useRouter } from 'next/router';

import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';

import { Typography } from 'components/ui-kit/Typography';
import { Icon } from 'components/ui-kit/Icon';
import { Link } from 'components/Link';
import { Avatar } from 'components/ui-kit/Avatar';
import { Button } from 'components/ui-kit/Button';

import styles from './Subheader.module.scss';

export function Subheader() {
  const router = useRouter();
  const { id: daoId } = router.query;
  const currentDao = useAtomValue(currentDaoAtom);

  if (!daoId || !currentDao) {
    return null;
  }

  const handleOnClick = () => {
    navigator.clipboard.writeText(currentDao.account.id);
  };

  return (
    <div className={styles.root}>
      <div className={styles['left-container']}>
        <span className={styles.logo}>
          <Avatar value={currentDao.name} />
        </span>
        <div className={styles['title-container']}>
          <Typography variant="title2">{currentDao.name}</Typography>
          <span className={styles['address-container']}>
            <Typography variant="caption3">{currentDao.account.id}</Typography>
            <Button variant="icon" size="xs" onClick={handleOnClick}>
              <Icon name="copy" size="xs" />
            </Button>
          </span>
        </div>
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
