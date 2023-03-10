import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useAtomValue, useSetAtom } from 'jotai';
import { currentAccountAtom } from 'store/account';
import { daosAtom } from 'store/dao';

import { formLinkByDaoId } from 'utils/formLinkByDaoId';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_DAO from 'query/subscribeDaos.graphql';

import { Icon } from 'components/ui-kit/Icon';
import { SidebarLink } from 'components/ui-kit/SidebarLink';
import { Avatar } from 'components/ui-kit/Avatar';
import { Button } from 'components/ui-kit/Button';

import type { SubscribeDaos } from 'types';

import styles from './Sidebar.module.scss';

export function Sidebar() {
  const router = useRouter();
  const currentAccount = useAtomValue(currentAccountAtom);
  const setDaos = useSetAtom(daosAtom);

  const { data, loading } = useSubscription<SubscribeDaos>(SUBSCRIBE_DAO);

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

  const handleAddClick = () => router.push(`/create-dao`);

  return (
    <aside className={styles.root}>
      <span className={styles['logo-container']}>
        <Link href="/">
          <Image
            src="/logo/societal-symbol.svg"
            alt="societal-symbol"
            width={44}
            height={44}
          />
        </Link>
      </span>

      <ul className={styles['center-container']}>
        {data?.daos.map((dao) => (
          <li key={dao.id}>
            <SidebarLink
              href={formLinkByDaoId(dao.id, 'dashboard')}
              active={daoId === dao.id}
            >
              <Avatar
                value={dao.name}
                className={styles['button-logo']}
                radius="rounded"
              />
            </SidebarLink>
          </li>
        ))}
      </ul>

      <div className={styles['bottom-container']}>
        <Button variant="icon" onClick={handleAddClick}>
          <Icon name="add" />
        </Button>
      </div>
    </aside>
  );
}
