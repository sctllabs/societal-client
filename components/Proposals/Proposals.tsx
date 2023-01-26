import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import { isNull } from 'utils/filters';

import type {
  ProposalCodec,
  ProposalMeta,
  ProposalTransfer,
  TransferCodec,
  TransferMeta,
  VoteCodec,
  VoteMeta
} from 'types';
import type { Option, Vec, u32 } from '@polkadot/types';
import type { H256 } from '@polkadot/types/interfaces';
import { appConfig } from 'config';

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
  const [transfers, setTransfers] = useState<TransferMeta[] | null>(null);
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
            .map((x, index) =>
              x.value.isEmpty
                ? null
                : {
                    ...(x.value.toHuman() as Omit<ProposalMeta, 'hash'>),
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
            .map((x, index) =>
              x.value.isEmpty
                ? null
                : {
                    ayes: x.value.ayes.map((aye) => aye.toString()),
                    nays: x.value.nays.map((nay) => nay.toString()),
                    threshold: x.value.threshold.toNumber(),
                    index: x.value.index.toNumber(),
                    end:
                      (x.value.end.toNumber() - currentBlock) *
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
  }, [api, daoId, proposalsHashes]);

  useEffect(() => {
    if (!proposals) {
      return undefined;
    }
    let unsubscribe: any | null = null;

    const _transferProposals = proposals.filter(
      (x) => x.method === 'approveProposal'
    );
    const _input = _transferProposals.map((_proposal) => [
      _proposal.args.dao_id,
      (_proposal.args as ProposalTransfer).proposal_id
    ]);

    api?.query.daoTreasury.proposals
      .multi<Option<TransferCodec>>(_input, (_transfers) =>
        setTransfers(
          _transfers
            .map((x, index) =>
              x.value.isEmpty
                ? null
                : {
                    hash: _transferProposals.find(
                      (_proposal) =>
                        (_proposal.args as ProposalTransfer).proposal_id ===
                        _input[index][1]
                    )!.hash,
                    daoId: x.value.daoId.toString(),
                    proposer: x.value.proposer.toString(),
                    value: x.value.value.toNumber(),
                    beneficiary: x.value.beneficiary.toString(),
                    bond: x.value.bond.toNumber()
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
  }, [api, daoId, proposals]);

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
            transfer={transfers?.find((x) => x.hash === proposal.hash)}
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
