import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useAtom, useAtomValue } from 'jotai';
import { apiAtom, currentAccountAtom } from 'store/api';
import { daosAtom } from 'store/dao';
import { queueTransactionAtom } from 'store/queue';

import { Icon } from 'components/ui-kit/Icon';
import { Link } from 'components/Link';

import type { DaoCodec, DaoInfo } from 'types';
import type { Option } from '@polkadot/types';

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
  const router = useRouter();
  const api = useAtomValue(apiAtom);
  const currentAccount = useAtomValue(currentAccountAtom);
  const queueTransaction = useAtomValue(queueTransactionAtom);
  const [daos, setDaos] = useAtom(daosAtom);

  const daoId = router.query.id as string;

  useEffect(() => {
    if (!api) {
      return;
    }

    api.query.dao.daos
      .entries<Option<DaoCodec>>()
      .then((x) => {
        setDaos(
          x.map(([id, dao]) => ({
            id: (id.toHuman() as string[])[0],
            dao: {
              ...(dao.value.toHuman() as DaoInfo),
              tokenId: dao.value.tokenId.toString()
            },
            icon: `/logo/${
              daoIconURLs[randomIntFromInterval(0, daoIconURLs.length - 1)]
            }`
          }))
        );
      })
      // eslint-disable-next-line no-console
      .catch(console.error);
  }, [api, setDaos, queueTransaction.length]);

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

      <div className={styles['center-container']}>
        {daos &&
          daos.map((x) => (
            <Link
              href={`/daos/${x.id}`}
              active={daoId === x.id}
              variant="nav"
              key={x.id}
            >
              <span className={styles['button-logo']}>
                <Image src={x.icon} alt={x.dao.config.name} fill />
              </span>
            </Link>
          ))}
      </div>

      <div className={styles['bottom-container']}>
        <Link href="/create-dao" variant="outlined">
          <Icon name="add" />
        </Link>
      </div>
    </aside>
  );
}
