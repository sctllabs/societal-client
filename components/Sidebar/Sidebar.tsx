import { useEffect } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useSetAtom } from 'jotai';
import { daosAtom } from 'store/dao';

import { formLinkByDaoId } from 'utils/formLinkByDaoId';
import { getImageUrlFromMetadata } from 'utils/getImageUrlFromMetadata';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_DAO from 'query/subscribeDaos.graphql';

import { Icon, IconNamesType } from 'components/ui-kit/Icon';
import { SidebarLink } from 'components/ui-kit/SidebarLink';
import { Avatar } from 'components/ui-kit/Avatar';
import { Button } from 'components/ui-kit/Button';

import type { SubscribeDaos } from 'types';

import styles from './Sidebar.module.scss';

type MainRoute = {
  iconName: IconNamesType;
  href: string;
  disabled: boolean;
};

const mainRoutes: MainRoute[] = [
  {
    iconName: 'home',
    href: '/home',
    disabled: false
  },
  {
    iconName: 'global',
    href: '/global',
    disabled: true
  },
  {
    iconName: 'appstore',
    href: '/appstore',
    disabled: true
  }
];

export function Sidebar() {
  const router = useRouter();
  const setDaos = useSetAtom(daosAtom);

  const { data, loading } = useSubscription<SubscribeDaos>(SUBSCRIBE_DAO);

  const daoId = router.query.id as string;

  useEffect(() => {
    if (!data) {
      return;
    }
    setDaos(data.daos);
  }, [data, setDaos]);

  if (loading) {
    return null;
  }

  const handleAddClick = () => router.push(`/create-dao`);

  return (
    <aside className={styles.root}>
      <span className={styles['main-container']}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/logo/societal-symbol.svg"
            alt="societal-symbol"
            width={44}
            height={44}
          />
        </Link>
        {mainRoutes.map(
          (route) =>
            !route.disabled && (
              <Link
                key={route.href}
                className={clsx(styles.link, {
                  [styles.active]: router.route === route.href
                })}
                href={route.href}
              >
                <Icon name={route.iconName} />
              </Link>
            )
        )}
      </span>

      <ul className={styles['daos-container']}>
        {data?.daos.map((dao) => (
          <li key={dao.id}>
            <SidebarLink
              href={formLinkByDaoId(dao.id, 'dashboard')}
              active={daoId === dao.id}
            >
              <Avatar
                value={dao.name}
                link={getImageUrlFromMetadata(dao.metadata, 'logo')}
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
