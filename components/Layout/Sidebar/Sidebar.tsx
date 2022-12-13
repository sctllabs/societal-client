import Link from 'next/link';

import { useAtomValue } from 'jotai';
import { currentAccountAtom } from 'store/api';

import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';

import SocietalSymbol from 'public/logo/societal-symbol.svg';

import styles from './Sidebar.module.scss';

export function Sidebar() {
  const currentAccount = useAtomValue(currentAccountAtom);

  if (!currentAccount) {
    return null;
  }

  return (
    <aside className={styles.root}>
      <Link href="/" className={styles['logo-container']}>
        <SocietalSymbol className={styles.logo} />
      </Link>

      <div className={styles['center-container']}>
        {Array.from(Array(100).keys()).map((x) => (
          <Button variant="nav" icon size="lg" key={x}>
            <span className={styles['button-logo']}>
              <SocietalSymbol width="100%" height="100%" />
            </span>
          </Button>
        ))}
      </div>

      <div className={styles['bottom-container']}>
        <Button variant="outlined" icon size="lg">
          <Icon name="add" />
        </Button>
      </div>
    </aside>
  );
}
