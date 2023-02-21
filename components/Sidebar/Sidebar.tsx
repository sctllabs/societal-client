import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useAtomValue, useSetAtom } from 'jotai';
import { currentAccountAtom } from 'store/account';
import { daosAtom } from 'store/dao';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_DAO from 'query/subscribeDaos.graphql';

import { Icon } from 'components/ui-kit/Icon';
import { Link } from 'components/Link';
import { Avatar } from 'components/ui-kit/Avatar';

import type { SubscribeDao } from 'types';

import styles from './Sidebar.module.scss';

export function Sidebar() {
  const router = useRouter();
  const currentAccount = useAtomValue(currentAccountAtom);
  const setDaos = useSetAtom(daosAtom);

  const { data, loading } = useSubscription<SubscribeDao>(SUBSCRIBE_DAO);

  const daoId = router.query.id as string;

  useEffect(() => {
    if (!data) {
      return;
    }
    setDaos(data.daos);
  }, [data, setDaos]);

  if (!currentAccount || loading) {
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
        {data?.daos.map((dao) => (
          <li key={dao.id}>
            <Link
              href={`/daos/${dao.id}`}
              active={daoId === dao.id}
              variant="nav"
            >
              <span className={styles['button-logo']}>
                <Avatar value={dao.name} />
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
