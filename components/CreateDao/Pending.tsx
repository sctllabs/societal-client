import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';

import { useAtomValue } from 'jotai';
import { daosAtom } from 'store/dao';
import { nameAtom, proposedDaoIdAtom } from 'store/createDao';

import { formLinkByDaoId } from 'utils/formLinkByDaoId';

import { Typography } from 'components/ui-kit/Typography';
import { Notification } from 'components/ui-kit/Notifications';

import pendingAnimation from 'public/animations/aBNove0ils.json';
import styles from './CreateDao.module.scss';

export function Pending() {
  const router = useRouter();
  const proposedDaoId = useAtomValue(proposedDaoIdAtom);
  const name = useAtomValue(nameAtom);
  const daos = useAtomValue(daosAtom);

  useEffect(() => {
    if (proposedDaoId === undefined) {
      router.push('/home');
      return;
    }

    const currentDao = daos?.find((x) => x.id === proposedDaoId.toString());
    if (!currentDao) {
      return;
    }

    toast.success(
      <Notification
        title="You've successfully created a new community"
        body="You can create new community and perform other actions."
        variant="success"
      />
    );
    router.push(formLinkByDaoId(currentDao.id, 'dashboard'));
  }, [proposedDaoId, daos, router]);

  return (
    <div className={styles['animation-container']}>
      <Lottie
        animationData={pendingAnimation}
        loop
        className={styles.animation}
      />
      <div className={styles['animation-content']}>
        <Typography variant="h3">Building Your {name}</Typography>
        <Typography variant="body1">
          We&apos;re creating your {name}! Please wait until we set it up, this
          may take a few seconds.
        </Typography>
      </div>
    </div>
  );
}
