import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSetAtom } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { useSubscription } from '@apollo/client';
import SUBSCRIBE_DAO_BY_ID from 'query/subscribeDaoById.graphql';
import type { QueryDaoById } from 'types';

import { Balance } from 'components/Balance';
import { Token } from 'components/Token';
import { About } from 'components/About';
import { Members } from 'components/Members';
import { TaskBoard } from 'components/TaskBoard';

import styles from 'styles/pages/dashboard.module.scss';

export default function DaoDashboard() {
  const router = useRouter();
  const setCurrentDao = useSetAtom(currentDaoAtom);

  const { data, loading } = useSubscription<QueryDaoById>(SUBSCRIBE_DAO_BY_ID, {
    variables: { id: router.query.id }
  });

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
    <>
      <Head>
        <title>{data?.daoById?.name}</title>
      </Head>

      <div className={styles.container}>
        <div className={styles['left-container']}>
          <Balance />
          <Token />
          <About />
        </div>
        <div className={styles['center-container']}>
          <TaskBoard />
        </div>
        <div className={styles['right-container']}>
          <Members />
        </div>
      </div>
    </>
  );
}
