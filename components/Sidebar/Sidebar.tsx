import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useAtom, useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import { createdDaoIdAtom, daosAtom } from 'store/dao';
import { currentAccountAtom } from 'store/account';

import type { DaoCodec, DaoInfo } from 'types';
import type { Option, StorageKey } from '@polkadot/types';
import { hexToString } from '@polkadot/util';

import { Icon } from 'components/ui-kit/Icon';
import { Link } from 'components/Link';
import { Avatar } from 'components/ui-kit/Avatar';

import styles from './Sidebar.module.scss';

export function Sidebar() {
  const router = useRouter();
  const api = useAtomValue(apiAtom);
  const currentAccount = useAtomValue(currentAccountAtom);
  const createdDaoId = useAtomValue(createdDaoIdAtom);
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
                token: {
                  FungibleToken: dao.value.token.isFungibleToken
                    ? dao.value.token.asFungibleToken.toNumber()
                    : undefined,
                  EthTokenAddress: dao.value.token.isEthTokenAddress
                    ? hexToString(dao.value.token.asEthTokenAddress.toString())
                    : undefined
                }
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
  }, [api, setDaos, createdDaoId]);

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
        {daos?.map((x) => (
          <li key={x.id}>
            <Link href={`/daos/${x.id}`} active={daoId === x.id} variant="nav">
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
