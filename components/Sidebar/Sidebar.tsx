import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useAtom, useAtomValue } from 'jotai';
import { apiAtom, currentAccountAtom } from 'store/api';
import { daoCreatedAtom, daosAtom } from 'store/dao';

import type { DaoCodec, DaoInfo } from 'types';
import type { Option, StorageKey } from '@polkadot/types';

import { Icon } from 'components/ui-kit/Icon';
import { Link } from 'components/Link';

import styles from './Sidebar.module.scss';
import { Avatar } from '../ui-kit/Avatar';

export function Sidebar() {
  const router = useRouter();
  const api = useAtomValue(apiAtom);
  const currentAccount = useAtomValue(currentAccountAtom);
  const daoCreated = useAtomValue(daoCreatedAtom);
  const [daos, setDaos] = useAtom(daosAtom);

  const daoId = router.query.id as string;

  useEffect(() => {
    let unsubscribe: any | null = null;

    api?.query.dao.daos
      .entries((_daos: [StorageKey, Option<DaoCodec>][]) =>
        setDaos(
          _daos
            .filter((x) => !x[1].value.isEmpty)
            .map(([id, dao]) => ({
              id: (id.toHuman() as string[])[0],
              dao: {
                ...(dao.value.toHuman() as DaoInfo),
                tokenId: dao.value.tokenId.toString()
              }
            }))
        )
      )
      .then((unsub) => {
        unsubscribe = unsub;
      })
      // eslint-disable-next-line no-console
      .catch(console.error);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [api, setDaos, daoCreated]);

  if (!currentAccount) {
    return null;
  }

  return (
    <aside className={styles.root}>
      <span className={styles['logo-container']}>
        <Link href="/">
          <span className={styles.logo}>
            <Image src="/logo/societal-symbol.svg" alt="societal-symbol" fill />
          </span>
        </Link>
      </span>

      <ul className={styles['center-container']}>
        {daos &&
          daos.map((x) => (
            <li key={x.id}>
              <Link
                href={`/daos/${x.id}`}
                active={daoId === x.id}
                variant="nav"
              >
                <span className={styles['button-logo']}>
                  <Avatar value={x.dao.config.name} />
                </span>
              </Link>
            </li>
          ))}
      </ul>

      <div className={styles['bottom-container']}>
        <Link href="/create-dao" variant="outlined">
          <Icon name="add" />
        </Link>
      </div>
    </aside>
  );
}
