import clsx from 'clsx';

import dynamic from 'next/dynamic';

import styles from './Header.module.scss';

const Account = dynamic(
  () => import('components/Account').then((mod) => mod.Account),
  {
    ssr: false
  }
);

export function Header() {
  return (
    <header className={styles.root}>
      <div className={styles.container}>
        <div className={clsx(styles.leftContainer)}>Search</div>
        <div className={clsx(styles.rightContainer)}>
          <Account />
        </div>
      </div>
    </header>
  );
}
