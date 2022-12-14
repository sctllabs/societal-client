import Link from 'next/link';
import Image from 'next/image';

import { useAtomValue } from 'jotai';
import { currentAccountAtom } from 'store/api';

import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';

import styles from './Sidebar.module.scss';

export function Sidebar() {
  const currentAccount = useAtomValue(currentAccountAtom);

  if (!currentAccount) {
    return null;
  }

  return (
    <aside className={styles.root}>
      <Link href="/" className={styles['logo-container']}>
        <div className={styles.logo}>
          <Image src="/logo/societal-symbol.svg" alt="societal-symbol" fill />
        </div>
      </Link>

      <div className={styles['center-container']}>
        {Array.from(Array(100).keys()).map((x) => (
          <Button variant="nav" icon size="lg" key={x}>
            <span className={styles['button-logo']}>
              <Image
                src="/logo/societal-symbol.svg"
                alt="societal-symbol"
                fill
              />
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
