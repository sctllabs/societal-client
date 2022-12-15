import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { useAtom, useAtomValue } from 'jotai';
import { apiAtom, currentAccountAtom } from 'store/api';
import { daosAtom } from 'store/dao';
import { DaoInfo } from 'types';

import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';

import styles from './Sidebar.module.scss';

const daoIconURLs = [
  'doola-symbol.svg',
  'karma-symbol.svg',
  'lobby-symbol.svg',
  'societal-symbol.svg',
  'talisman.svg',
  'uniswap.svg'
];

function randomIntFromInterval(min: number, max: number) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function Sidebar() {
  const api = useAtomValue(apiAtom);
  const currentAccount = useAtomValue(currentAccountAtom);
  const [daos, setDaos] = useAtom(daosAtom);

  useEffect(() => {
    if (!api) {
      return;
    }

    api.query.dao.daos
      .entries()
      .then((x) => {
        setDaos(
          x.map(([id, dao]) => ({
            id: (id.toHuman() as string[])[0],
            dao: dao.toHuman() as DaoInfo,
            icon: daoIconURLs[randomIntFromInterval(0, daoIconURLs.length - 1)]
          }))
        );
      })
      // eslint-disable-next-line no-console
      .catch(console.error);
  }, [api, setDaos]);

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
        {daos &&
          daos.map((x) => (
            <Link href={`daos/${x.id}`} key={x.id}>
              <Button variant="nav" icon size="lg">
                <span className={styles['button-logo']}>
                  <Image src={`/logo/${x.icon}`} alt="societal-symbol" fill />
                </span>
              </Button>
            </Link>
          ))}
      </div>

      <div className={styles['bottom-container']}>
        <Link href="/create-dao">
          <Button variant="outlined" icon size="lg">
            <Icon name="add" />
          </Button>
        </Link>
      </div>
    </aside>
  );
}
