import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSetAtom } from 'jotai';
import { currentDaoAtom } from 'store/dao';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_DAO_BY_ID from 'query/subscribeDaoById.graphql';
import type { SubscribeDaoById } from 'types';
import { Proposals } from 'components/Proposals';
import { Referendum } from 'components/Referendum';

import styles from 'styles/pages/governance.module.scss';

export default function DaoGovernance() {
  const router = useRouter();
  const setCurrentDao = useSetAtom(currentDaoAtom);

  const { data, loading } = useSubscription<SubscribeDaoById>(
    SUBSCRIBE_DAO_BY_ID,
    {
      variables: { id: router.query.id }
    }
  );

  useEffect(() => {
    if (router.query.id && typeof router.query.id !== 'string') {
      router.push('/404');
      return;
    }
    if (loading) {
      return;
    }
    if (!data || !data.daoById) {
      router.push('/404');
    }
  }, [data, loading, router]);

  useEffect(() => {
    if (!data || !data.daoById) {
      return;
    }

    setCurrentDao(data.daoById);
  }, [data, setCurrentDao]);

  if (loading) {
    // TODO @asanzyb create a loader
    return null;
  }

  return (
    <div className={styles.container}>
      <Proposals />
      <Referendum />
    </div>
  );
}
