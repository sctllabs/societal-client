import { KeyboardEventHandler, MouseEventHandler, useEffect } from 'react';
import clsx from 'clsx';
import { useAtom, useAtomValue } from 'jotai';
import { curatorBountiesAtom, selectedCuratorBountyAtom } from 'store/bounty';

import { BountyCard } from 'components/BountyCard';
import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';

import styles from './CuratorBounties.module.scss';

export function CuratorBounties() {
  const curatorBounties = useAtomValue(curatorBountiesAtom);
  const [selectedCuratorBounty, setSelectedCuratorBounty] = useAtom(
    selectedCuratorBountyAtom
  );

  useEffect(() => {
    if (!curatorBounties || !curatorBounties.length) {
      return;
    }

    setSelectedCuratorBounty(curatorBounties[0].id);
  }, [curatorBounties, setSelectedCuratorBounty]);

  const handleSelect = (id: string | null) => {
    setSelectedCuratorBounty(id);
  };

  const handleClick: MouseEventHandler<HTMLUListElement> = (e) => {
    const li = (e.target as HTMLElement).closest('li');
    if (!li) {
      return;
    }
    const id = li.getAttribute('data-id');
    handleSelect(id);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLUListElement> = (e) => {
    if (e.key !== ' ' && e.key !== 'Enter') {
      return;
    }

    const id = (e.target as HTMLLIElement).getAttribute('data-id');
    handleSelect(id);
  };

  useEffect(() => {
    const eventClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).getElementsByTagName('ul').length > 0) {
        // setSelectedCuratorBounty(null);
      }
    };

    window.addEventListener('click', eventClick);

    return () => window.removeEventListener('click', eventClick);
  }, [setSelectedCuratorBounty]);

  return (
    <div className={styles.container}>
      {curatorBounties && curatorBounties.length > 0 ? (
        <ul
          className={styles.list}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
          role="presentation"
        >
          {curatorBounties.map((bounty) => (
            <li
              className={clsx(styles.item, {
                [styles.active]: bounty.id === selectedCuratorBounty
              })}
              key={bounty.id}
              data-id={bounty.id}
            >
              <BountyCard bounty={bounty} />
            </li>
          ))}
        </ul>
      ) : (
        <Card className={styles['proposals-empty-card']}>
          <Typography variant="caption2" className={styles.caption}>
            You don&apos;t have any bounties yet
          </Typography>
        </Card>
      )}
    </div>
  );
}
