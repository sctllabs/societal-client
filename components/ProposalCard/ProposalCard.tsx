import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import {
  accountsAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';

import {
  LENGTH_BOUND,
  PROPOSAL_WEIGHT_BOUND,
  PROPOSAL_WEIGHT_BOUND_OLD,
  PROPOSAL_WEIGHT_KEY,
  PROPOSAL_WEIGHT_TYPE
} from 'constants/transaction';

import type {
  ProposalMember,
  ProposalMeta,
  ProposalType,
  TransferMeta,
  VoteMeta
} from 'types';

import { TxButton } from 'components/TxButton';
import { Icon, IconNamesType } from 'components/ui-kit/Icon';
import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Countdown } from 'components/Countdown';

import styles from './ProposalCard.module.scss';
import { Button } from '../ui-kit/Button';
import { useDaoCollectiveContract } from '../../hooks/useDaoCollectiveContract';

export enum ProposalEnum {
  TRANSFER = 'Transfer',
  ADD_MEMBER = 'Add Member',
  REMOVE_MEMBER = 'Remove Member'
}

type ProposalSettings = {
  title: string;
  icon: IconNamesType;
};

export interface ProposalCardProps {
  proposal: ProposalMeta;
  vote?: VoteMeta;
  transfer?: TransferMeta;
}

const getProposalSettings = (
  proposalMethod: ProposalType
): ProposalSettings => {
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
    case 'approveProposal': {
      return {
        title: ProposalEnum.TRANSFER,
        icon: 'transfer'
      };
    }
    default: {
      return {
        title: ProposalEnum.TRANSFER,
        icon: 'transfer'
      };
    }
  }
};

export function ProposalCard({ proposal, vote, transfer }: ProposalCardProps) {
  const api = useAtomValue(apiAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const accounts = useAtomValue(accountsAtom);
  const { title, icon } = getProposalSettings(proposal.method);
  const daoCollectiveContract = useDaoCollectiveContract();

  const proposalWeightBound = useMemo(() => {
    const proposalWeightBoundArg = api?.tx.daoCouncil.close.meta.args.find(
      (_arg) => _arg.name.toString() === PROPOSAL_WEIGHT_KEY
    );

    if (!proposalWeightBoundArg) {
      return PROPOSAL_WEIGHT_BOUND_OLD;
    }

    if (proposalWeightBoundArg.type.toString() === PROPOSAL_WEIGHT_TYPE) {
      return PROPOSAL_WEIGHT_BOUND;
    }
    return PROPOSAL_WEIGHT_BOUND_OLD;
  }, [api?.tx.daoCouncil.close.meta.args]);

  const handleVoteYes = async () => {
    if (!metamaskAccount || !vote) {
      return;
    }

    await daoCollectiveContract
      ?.connect(metamaskAccount)
      .vote(proposal.args.dao_id, proposal.hash, vote.index, true);
  };

  const handleVoteNo = async () => {
    if (!metamaskAccount || !vote) {
      return;
    }

    await daoCollectiveContract
      ?.connect(metamaskAccount)
      .vote(proposal.args.dao_id, proposal.hash, vote.index, false);
  };

  const handleProposalFinish = async () => {
    if (!metamaskAccount || !vote) {
      return;
    }

    await daoCollectiveContract
      ?.connect(metamaskAccount)
      .close(
        proposal.args.dao_id,
        proposal.hash,
        vote.index,
        100000000000,
        10000
      );
  };

  return (
    <Card className={styles['proposal-card']}>
      <div className={styles['proposal-title-container']}>
        <Icon name={icon} className={styles['proposal-icon']} />
        <span className={styles['proposal-title-items']}>
          <span className={styles['proposal-title-item']}>
            <Typography variant="title4">{title}</Typography>
            {transfer && (
              <Typography variant="caption2">
                by
                {
                  accounts?.find(
                    (_account) => _account.address === transfer.proposer
                  )?.meta.name as string
                }
              </Typography>
            )}
          </span>
          {vote && (
            <span className={styles['proposal-title-item-countdown']}>
              <Countdown end={vote.end} typography="value5" />
              <Typography variant="caption2">left</Typography>
            </span>
          )}
        </span>
      </div>

      <div className={styles['proposal-bottom-container']}>
        {proposal.method === 'approveProposal' ? (
          <span className={styles['proposal-transfer-container']}>
            <span className={styles['proposal-transfer-info']}>
              <Typography variant="caption3">Amount</Typography>
              <Typography variant="title5">{transfer?.value || 0}</Typography>
            </span>
            <span className={styles['proposal-transfer-info']}>
              <Typography variant="caption3">Target</Typography>
              <Typography variant="title5">
                {(accounts?.find(
                  (_account) => _account.address === transfer?.beneficiary
                )?.meta.name as string) ?? transfer?.beneficiary}
              </Typography>
            </span>
          </span>
        ) : (
          <span className={styles['proposal-member-info']}>
            <Typography variant="caption3">Member</Typography>
            <span className={styles['proposal-member-address']}>
              <Icon name="user-profile" size="xs" />
              <Typography variant="title5">
                {
                  accounts?.find(
                    (_account) =>
                      _account.address === (proposal.args as ProposalMember).who
                  )?.meta.name as string
                }
              </Typography>
            </span>
          </span>
        )}
        <span className={styles['proposal-vote-buttons']}>
          <span className={styles['proposal-vote-button-container']}>
            {metamaskAccount ? (
              <Button
                variant="ghost"
                disabled={!vote}
                className={styles['button-vote']}
                onClick={handleVoteNo}
              >
                <Icon name="vote-no" />
              </Button>
            ) : (
              <TxButton
                disabled={!vote}
                accountId={substrateAccount?.address}
                tx={api?.tx.daoCouncil.vote}
                variant="ghost"
                params={[
                  proposal.args.dao_id,
                  proposal.hash,
                  vote?.index,
                  false
                ]}
                className={styles['button-vote']}
              >
                <Icon name="vote-no" />
              </TxButton>
            )}

            <Typography variant="caption2">{vote?.nays.length || 0}</Typography>
          </span>

          <div className={styles['vertical-break']} />
          <span className={styles['proposal-vote-button-container']}>
            {metamaskAccount ? (
              <Button
                variant="ghost"
                disabled={!vote}
                className={styles['button-vote']}
                onClick={handleVoteYes}
              >
                <Icon name="vote-yes" />
              </Button>
            ) : (
              <TxButton
                disabled={!vote}
                accountId={substrateAccount?.address}
                tx={api?.tx.daoCouncil.vote}
                params={[
                  proposal.args.dao_id,
                  proposal.hash,
                  vote?.index,
                  true
                ]}
                variant="ghost"
                className={styles['button-vote']}
              >
                <Icon name="vote-yes" />
              </TxButton>
            )}

            <Typography variant="caption2">{vote?.ayes.length || 0}</Typography>
          </span>
          {vote &&
            (vote.ayes.length >= vote.threshold ||
              vote.nays.length >= vote.threshold) && (
              <>
                <div className={styles['vertical-break']} />
                <span className={styles['proposal-vote-button-container']}>
                  {metamaskAccount ? (
                    <Button
                      disabled={!vote}
                      variant="ghost"
                      className={styles['button-vote']}
                      onClick={handleProposalFinish}
                    >
                      <Icon name="send" />
                    </Button>
                  ) : (
                    <TxButton
                      disabled={!vote}
                      accountId={substrateAccount?.address}
                      tx={api?.tx.daoCouncil.close}
                      params={[
                        proposal.args.dao_id,
                        proposal.hash,
                        vote.index,
                        proposalWeightBound,
                        LENGTH_BOUND
                      ]}
                      variant="ghost"
                      className={styles['button-vote']}
                    >
                      <Icon name="send" />
                    </TxButton>
                  )}

                  <Typography variant="caption2">Finish</Typography>
                </span>
              </>
            )}
        </span>
      </div>
    </Card>
  );
}
