import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { useAtomValue } from 'jotai';
import { daosAtom } from 'store/dao';
import { currentAccountAtom } from 'store/api';

import { Balance } from 'components/Balance';
import { Token } from 'components/Token';
import { About } from 'components/About';
import { Proposals } from 'components/Proposals';
import { Members } from 'components/Members';

import styles from 'styles/pages/DAOs.module.scss';

export default function Dao() {
  const daos = useAtomValue(daosAtom);
  const currentAccount = useAtomValue(currentAccountAtom);
  const router = useRouter();

  useEffect(() => {
    if (typeof router.query.id !== 'string') {
      router.push('/404');
    }
  }, [router]);

  useEffect(() => {
    if (!currentAccount) {
      router.push('/');
    }
  }, [currentAccount, router]);

  const currentDao = daos?.find((x) => x.id === router.query.id);

  useEffect(() => {
    if (!daos) {
      return;
    }
    if (!currentDao) {
      router.push('/404');
    }
  }, [currentDao, daos, router]);

  const id = router.query.id as string;

  return (
    <>
      <Head>
        <title>{currentDao?.dao.config.name}</title>
      </Head>

      <div className={styles.container}>
        <div className={styles['left-container']}>
          <Balance daoId={id} />
          <Token daoId={id} />
          <About daoId={id} />
        </div>
        <div className={styles['center-container']}>
          <Proposals daoId={id} />
        </div>
        <div className={styles['right-container']}>
          <Members daoId={id} />
        </div>
      </div>
    </>
  );
}
