import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';

import { useAtomValue } from 'jotai';
import { daosAtom } from 'store/dao';

import { formLinkByDaoId } from 'utils/formLinkByDaoId';

import { Typography } from 'components/ui-kit/Typography';
import { Notification } from 'components/ui-kit/Notifications';

import styles from 'styles/pages/pending.module.scss';

import pendingAnimation from 'public/animations/aBNove0ils.json';

export default function Pending() {
  const name = 'Societal';
  const router = useRouter();
  const createdDaoId = router.query['created-dao-id'];
  const daos = useAtomValue(daosAtom);

  useEffect(() => {
    if (typeof createdDaoId !== 'string') {
      router.push('/home');
      return;
    }

    const currentDao = daos?.find((x) => x.id === createdDaoId);
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
  }, [createdDaoId, daos, router]);

  return (
    <div className={styles.container}>
      <Lottie
        animationData={pendingAnimation}
        loop
        className={styles.animation}
      />
      <div className={styles.content}>
        <Typography variant="h3">Building Your {name}</Typography>
        <Typography variant="body1">
          We&apos;re creating your {name}! Please wait until we set it up, this
          may take a few seconds.
        </Typography>
      </div>
    </div>
  );
}
