import { useEffect, useState } from 'react';

import { appConfig } from 'config';
import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import { isNull } from 'utils/filters';

import type {
  ProposalCodec,
  ProposalMeta,
  ProposalMethod,
  VoteCodec,
  VoteMeta
} from 'types';
import type { Option, Vec, u32 } from '@polkadot/types';
import type { H256 } from '@polkadot/types/interfaces';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { ProposalCard } from 'components/ProposalCard';

import styles from './Proposals.module.scss';

export interface ProposalsProps {
  daoId: string;
}

export function Proposals({ daoId }: ProposalsProps) {
  const api = useAtomValue(apiAtom);
  const [proposalsHashes, setProposalsHashes] = useState<string[] | null>(null);
  const [proposals, setProposals] = useState<ProposalMeta[] | null>(null);
  const [votes, setVotes] = useState<VoteMeta[] | null>(null);
  const [currentBlock, setCurrentBlock] = useState<number | null>(null);

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
    let unsubscribe: any | null = null;

    api?.query.daoCouncil
      .proposals(daoId, (_proposals: Vec<H256>) =>
        setProposalsHashes(_proposals.map((_proposal) => _proposal.toString()))
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
  }, [api, daoId]);

  useEffect(() => {
    if (!proposalsHashes) {
      return undefined;
    }
    let unsubscribe: any | null = null;

    const _input = proposalsHashes.map((x) => [daoId, x]);

    api?.query.daoCouncil.proposalOf
      .multi<Option<ProposalCodec>>(_input, (_proposalsMeta) =>
        setProposals(
          _proposalsMeta
            .map((_proposalMeta, index) =>
              _proposalMeta.value.isEmpty
                ? null
                : {
                    hash: proposalsHashes[index],
                    method:
                      _proposalMeta.value.method.toString() as ProposalMethod,
                    section: _proposalMeta.value.method.toString(),
                    args:
                      _proposalMeta.value.args.length === 3
                        ? {
                            dao_id: _proposalMeta.value.args[0].toNumber(),
                            amount: _proposalMeta.value.args[1].toBigInt(),
                            beneficiary: _proposalMeta.value.args[2].toString()
                          }
                        : {
                            dao_id: _proposalMeta.value.args[0].toNumber(),
                            who: _proposalMeta.value.args[1].toString()
                          }
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
  }, [api, daoId, proposalsHashes]);

  useEffect(() => {
    if (!proposalsHashes || !currentBlock) {
      return undefined;
    }
    let unsubscribe: any | null = null;

    const _input = proposalsHashes.map((x) => [daoId, x]);

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
                    hash: proposalsHashes[index]
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
  }, [api, currentBlock, daoId, proposalsHashes]);

  return (
    <>
      <Card className={styles['proposals-title-card']}>
        <Typography variant="title4">Proposals</Typography>
      </Card>
      {proposals ? (
        proposals.map((proposal) => (
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
