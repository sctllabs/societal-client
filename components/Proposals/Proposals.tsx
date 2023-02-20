import { useEffect, useState } from 'react';

import { appConfig } from 'config';
import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { apiAtom } from 'store/api';
import { isNull } from 'utils/filters';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_PROPOSAL_BY_DAO_ID from 'query/subscribeProposalsByDaoId.graphql';

import type { SubscribeProposalsByDaoId, VoteCodec, VoteMeta } from 'types';
import type { Option, u32 } from '@polkadot/types';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { ProposalCard } from 'components/ProposalCard';

import styles from './Proposals.module.scss';

export function Proposals() {
  const api = useAtomValue(apiAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const [votes, setVotes] = useState<VoteMeta[] | null>(null);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);

  const { data } = useSubscription<SubscribeProposalsByDaoId>(
    SUBSCRIBE_PROPOSAL_BY_DAO_ID,
    {
      variables: { daoId: currentDao?.id }
    }
  );

  useEffect(() => {
    (async () => {
      const _currentBlock = (
        (await api?.query.system.number()) as u32 | undefined
      )?.toNumber();

      if (!_currentBlock) {
        return;
      }
      setCurrentBlock(_currentBlock);
    })();
  }, [api?.query.system]);

  useEffect(() => {
    if (!currentDao || !data || !currentBlock) {
      return undefined;
    }
    let unsubscribe: any | null = null;

    const _input = data.proposals.map((_proposal) => [
      currentDao.id,
      _proposal.hash
    ]);

    api?.query.daoCouncil.voting
      .multi<Option<VoteCodec>>(_input, (_votes) =>
        setVotes(
          _votes
            .map((_vote, index) =>
              _vote.value.isEmpty
                ? null
                : {
                    ayes: _vote.value.ayes.map((aye) => aye.toString()),
                    nays: _vote.value.nays.map((nay) => nay.toString()),
                    threshold: _vote.value.threshold.toNumber(),
                    index: _vote.value.index.toNumber(),
                    end:
                      (_vote.value.end.toNumber() - currentBlock) *
                      1000 *
                      appConfig.expectedBlockTimeInSeconds,
                    hash: data.proposals[index].hash
                  }
            )
            .filter(isNull)
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
  }, [api, currentBlock, currentDao, data]);

  return (
    <>
      <Card className={styles['proposals-title-card']}>
        <Typography variant="title4">Proposals</Typography>
      </Card>
      {data?.proposals ? (
        data.proposals.map((proposal) => (
          <ProposalCard
            key={proposal.hash}
            proposal={proposal}
            vote={votes?.find((x) => x.hash === proposal.hash)}
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
