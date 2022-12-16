import { useCallback, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Icon, IconNamesType } from 'components/ui-kit/Icon';
import { TxButton } from 'components/TxButton';

import type { Option } from '@polkadot/types';
import type {
  ProposalCodec,
  ProposalMeta,
  ProposalType,
  VoteCodec,
  VoteMeta
} from 'types';

import styles from './Proposals.module.scss';

export interface ProposalsProps {
  daoId: string;
}

type ProposalSettings = {
  title: string;
  icon: IconNamesType;
};

export enum ProposalEnum {
  TRANSFER = 'Transfer',
  ADD_MEMBER = 'Add Member',
  REMOVE_MEMBER = 'Remove Member'
}

export function Proposals({ daoId }: ProposalsProps) {
  const api = useAtomValue(apiAtom);
  const [proposalsHashes, setProposalsHashes] = useState<string[] | null>(null);
  const [proposals, setProposals] = useState<ProposalMeta[] | null>(null);
  const [votes, setVotes] = useState<VoteMeta[] | null>(null);

  useEffect(() => {
    if (!api) {
      return undefined;
    }

    let unsubscribe: any | null = null;

    api.query.daoCouncil
      .proposals(daoId)
      .then((x) => setProposalsHashes(x.toHuman() as string[]))
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
    if (!api || !proposalsHashes) {
      return undefined;
    }
    let unsubscribe: any | null = null;

    const _input = proposalsHashes.map((x) => [daoId, x]);

    api.query.daoCouncil.proposalOf
      .multi<Option<ProposalCodec>>(_input, (_proposalsMeta) =>
        setProposals(
          _proposalsMeta.map((x, index) => ({
            ...(x.value.toHuman() as Omit<ProposalMeta, 'hash'>),
            hash: proposalsHashes[index]
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
  }, [api, daoId, proposalsHashes]);

  useEffect(() => {
    if (!api || !proposalsHashes) {
      return undefined;
    }
    let unsubscribe: any | null = null;

    const _input = proposalsHashes.map((x) => [daoId, x]);

    api.query.daoCouncil.voting
      .multi<Option<VoteCodec>>(_input, (_votes) =>
        setVotes(
          _votes.map((x, index) => ({
            ayes: x.value.ayes.map((aye) => aye.toString()),
            nays: x.value.nays.map((nay) => nay.toString()),
            threshold: x.value.threshold.toNumber(),
            index: x.value.index.toNumber(),
            end: x.value.end.toNumber(),
            hash: proposalsHashes[index]
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
  }, [api, daoId, proposalsHashes]);

  const getProposalSettings = useCallback(
    (proposalMethod: ProposalType): ProposalSettings => {
      switch (proposalMethod) {
        case 'addMember': {
          return {
            title: ProposalEnum.ADD_MEMBER,
            icon: 'user-add'
          };
        }
        case 'removeMember': {
          return {
            title: ProposalEnum.REMOVE_MEMBER,
            icon: 'user-delete'
          };
        }
        default: {
          return {
            title: ProposalEnum.TRANSFER,
            icon: 'transfer'
          };
        }
      }
    },
    []
  );

  const renderProposal = useCallback(
    (proposal: ProposalMeta) => {
      const { title, icon } = getProposalSettings(proposal.method);

      return (
        <Card key={proposal.hash} className={styles['proposal-card']}>
          <div className={styles['proposal-title']}>
            <Icon name={icon} className={styles['proposal-icon']} />
            <Typography variant="title4">{title}</Typography>
          </div>
          <div className={styles['proposal-description']}>
            <Typography variant="body2">Proposal Description</Typography>
          </div>
          <div className={styles['proposal-bottom-container']}>
            {proposal.method !== 'addMember' ? (
              <span>Amount</span>
            ) : (
              <span className={styles['proposal-member-info']}>
                <Typography variant="caption3">Member</Typography>
                <span className={styles['proposal-member-address']}>
                  <Icon name="user-profile" size="xs" />
                  <Typography variant="title7">{proposal.args.who}</Typography>
                </span>
              </span>
            )}
            <span className={styles['proposal-vote-buttons']}>
              <span className={styles['proposal-vote-button-container']}>
                <TxButton variant="ghost" className={styles['button-vote']}>
                  <Icon name="vote-no" />
                </TxButton>
                <Typography variant="caption2">
                  {votes?.find((vote) => vote.hash === proposal.hash)?.nays
                    .length || 0}
                </Typography>
              </span>

              <div className={styles['vertical-break']} />
              <span className={styles['proposal-vote-button-container']}>
                <TxButton variant="ghost" className={styles['button-vote']}>
                  <Icon name="vote-yes" />
                </TxButton>
                <Typography variant="caption2">
                  {votes?.find((vote) => vote.hash === proposal.hash)?.ayes
                    .length || 0}
                </Typography>
              </span>
            </span>
          </div>
        </Card>
      );
    },
    [getProposalSettings, votes]
  );

  return (
    <>
      <Card className={styles['proposals-title-card']}>
        <Typography variant="title4">Proposals</Typography>
      </Card>
      {proposals ? (
        proposals.map((proposal) => renderProposal(proposal))
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
