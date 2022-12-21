import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { useAtomValue } from 'jotai';
import { daosAtom } from 'store/dao';
import { currentAccountAtom } from 'store/account';

import { Balance } from 'components/Balance';
import { Token } from 'components/Token';
import { About } from 'components/About';
import { Proposals } from 'components/Proposals';
import { Members } from 'components/Members';

import styles from 'styles/pages/DAOs.module.scss';
import { statesLoadingAtom } from 'store/loader';

export default function Dao() {
  const daos = useAtomValue(daosAtom);
  const currentAccount = useAtomValue(currentAccountAtom);
  const loading = useAtomValue(statesLoadingAtom);
  const router = useRouter();

  const currentDao = daos?.find((x) => x.id === router.query.id);
  const daoId = router.query.id as string;

  useEffect(() => {
    if (router.query.id && typeof router.query.id !== 'string') {
      router.push('/404');
      return;
    }
    if (loading) {
      return;
    }
    if (!currentAccount) {
      router.push('/');
      return;
    }
    if (!daos) {
      return;
    }
    if (!currentDao) {
      router.push('/404');
    }
  }, [currentAccount, currentDao, daos, loading, router]);

  return (
    <>
      <Head>
        <title>{currentDao?.dao.config.name}</title>
      </Head>

      <div className={styles.container}>
        <div className={styles['left-container']}>
          <Balance daoId={daoId} />
          <Token daoId={daoId} />
          <About daoId={daoId} />
        </div>
        <div className={styles['center-container']}>
          <Proposals daoId={daoId} />
        </div>
        <div className={styles['right-container']}>
          <Members daoId={daoId} />
        </div>
      </div>
    </>
  );
}
