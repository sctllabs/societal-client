import { Account } from 'components/Account';

import styles from './Header.module.scss';

export function Header() {
  return (
    <header className={styles.root}>
      <div className={styles.container}>
        <div className={styles.leftContainer}>Search</div>
        <div className={styles.rightContainer}>
          <Account />
        </div>
      </div>
    </header>
  );
}
