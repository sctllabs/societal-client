import clsx from 'clsx';

import dynamic from 'next/dynamic';

const Account = dynamic(
  () => import('components/Account').then((mod) => mod.Account),
  {
    ssr: false
  }
);

import styles from './Header.module.scss';

export function Header() {
  return (
    <header className={styles.root}>
      <div className={styles.container}>
        <div className={clsx(styles.leftContainer)}></div>
        <div className={clsx(styles.rightContainer)}>
          <Account />
        </div>
      </div>
    </header>
  );
}
