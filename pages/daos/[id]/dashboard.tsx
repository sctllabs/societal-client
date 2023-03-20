import Head from 'next/head';

import { useAtomValue } from 'jotai';
import { currentDaoAtom, currentDaoLoadingAtom } from 'store/dao';

import { Balance } from 'components/Balance';
import { Token } from 'components/Token';
import { About } from 'components/About';
import { Members } from 'components/Members';
import { TaskBoard } from 'components/TaskBoard';
import { AccountTokenBalance } from 'components/AccountTokenBalance';

import styles from 'styles/pages/dashboard.module.scss';

export default function DaoDashboard() {
  const currentDao = useAtomValue(currentDaoAtom);
  const currentDaoLoading = useAtomValue(currentDaoLoadingAtom);

  if (currentDaoLoading) {
    // TODO @asanzyb create a loader
    return null;
  }

  return (
    <>
      <Head>
        <title>{currentDao?.name}</title>
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
          <AccountTokenBalance />
        </div>
      </div>
    </>
  );
}
