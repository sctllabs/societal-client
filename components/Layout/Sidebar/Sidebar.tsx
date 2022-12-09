import styles from './Sidebar.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';

export function Sidebar() {
  return (
    <div className={styles.root}>
      <Link href={'/'} className={styles['logo-container']}>
        <div className={styles.logo}>
          <Image
            src={'/logo/societal-symbol.svg'}
            alt={'societal-symbol'}
            fill
          />
        </div>
      </Link>

      <div className={styles['center-container']}>
        {Array.from(Array(100).keys()).map((x) => (
          <Button variant={'nav'} icon size={'lg'} key={x}>
            <div className={styles['center-logo']}>
              <Image
                src={'/logo/societal-symbol.svg'}
                alt={'societal-symbol'}
                fill
              />
            </div>
          </Button>
        ))}
      </div>

      <div className={styles['bottom-container']}>
        <Button variant={'outlined'} icon size={'lg'}>
          <Icon name={'add'} />
        </Button>
      </div>
    </div>
  );
}
