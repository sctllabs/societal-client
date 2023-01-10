import { ConnectWallet } from 'components/ConnectWallet';
import { Search } from 'components/Search';
import { Subheader } from 'components/Subheader';

import styles from './Header.module.scss';

export function Header() {
  return (
    <header className={styles.root}>
      <div className={styles.container}>
        <div className={styles.leftContainer}>
          <Search />
        </div>
        <div className={styles.rightContainer}>
          <ConnectWallet />
        </div>
      </div>
      <Subheader />
    </header>
  );
}
