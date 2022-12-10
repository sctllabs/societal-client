import clsx from 'clsx';

import styles from './Header.module.scss';
import { Account } from '../../Account';

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
