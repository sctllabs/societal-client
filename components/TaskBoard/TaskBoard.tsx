import { MouseEventHandler, useEffect, useState } from 'react';

import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { apiAtom } from 'store/api';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_PROPOSAL_BY_DAO_ID from 'query/subscribeProposalsByDaoId.graphql';

import type { SubscribeProposalsByDaoId } from 'types';
import type { u32 } from '@polkadot/types';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { TaskCard } from 'components/TaskCard';

import styles from './TaskBoard.module.scss';

type FilterVariant = 'All' | 'In Progress' | 'Completed';

type FilterOption = {
  title: FilterVariant;
};

const filterOptions: FilterOption[] = [
  { title: 'All' },
  { title: 'In Progress' },
  { title: 'Completed' }
];

export function TaskBoard() {
  const api = useAtomValue(apiAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterVariant>('All');

  const { data } = useSubscription<SubscribeProposalsByDaoId>(
    SUBSCRIBE_PROPOSAL_BY_DAO_ID,
    {
      variables: { daoId: currentDao?.id }
    }
  );

  useEffect(() => {
    const fetchCurrentBlock = async () => {
      const _currentBlock = (
        (await api?.query.system.number()) as u32 | undefined
      )?.toNumber();

      if (!_currentBlock) {
        return;
      }
      setCurrentBlock(_currentBlock);
    };

    fetchCurrentBlock();
  }, [api?.query.system]);

  const handleFilterClick: MouseEventHandler<HTMLButtonElement> = (e) =>
    setFilter((e.target as HTMLButtonElement).innerText as FilterVariant);

  return (
    <>
      <Card className={styles['header-card']}>
        <Typography variant="title4">Task Board</Typography>
        <div className={styles['filter-container']}>
          {currentDao &&
            filterOptions.map((_filterOption) => (
              <Button
                data-active={filter === _filterOption.title}
                key={_filterOption.title}
                variant="nav"
                onClick={handleFilterClick}
              >
                <Typography variant="title7">{_filterOption.title}</Typography>
              </Button>
            ))}
        </div>
      </Card>
      {data?.councilProposals ? (
        data.councilProposals
          .filter((proposal) => {
            if (filter === 'Completed') {
              return proposal.status === 'Executed';
            }
            if (filter === 'In Progress') {
              return proposal.status === 'Open';
            }
            return proposal;
          })
          .map((proposal) => (
            <TaskCard
              key={proposal.hash}
              proposal={proposal}
              currentBlock={currentBlock}
            />
          ))
      ) : (
        <Card className={styles['proposals-empty-card']}>
          <Typography variant="caption2" className={styles.caption}>
            You don&apos;t have any proposals yet
          </Typography>
        </Card>
      )}
    </>
  );
}
