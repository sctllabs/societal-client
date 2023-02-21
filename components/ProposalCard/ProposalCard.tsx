import { useMemo } from 'react';
import { toast } from 'react-toastify';
import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import {
  accountsAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';
import { currentDaoAtom } from 'store/dao';
import { appConfig } from 'config';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_VOTES_BY_PROPOSAL_ID from 'query/subscribeVotesByProposalId.graphql';

import { useDaoCollectiveContract } from 'hooks/useDaoCollectiveContract';

import {
  LENGTH_BOUND,
  PROPOSAL_WEIGHT_BOUND,
  PROPOSAL_WEIGHT_BOUND_OLD,
  PROPOSAL_WEIGHT_KEY,
  PROPOSAL_WEIGHT_TYPE
} from 'constants/transaction';

import type {
  AddMemberProposal,
  ProposalKind,
  ProposalMeta,
  RemoveMemberProposal,
  SpendProposal,
  SubscribeVotesByProposalId,
  TransferProposal,
  TxCallback
} from 'types';

import { Button } from 'components/ui-kit/Button';
import { TxButton } from 'components/TxButton';
import { Icon, IconNamesType } from 'components/ui-kit/Icon';
import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Notification } from 'components/ui-kit/Notifications';
import { Countdown } from 'components/Countdown';

import styles from './ProposalCard.module.scss';

export enum ProposalEnum {
  TRANSFER = 'Transfer',
  TRANSFER_GOVERNANCE_TOKEN = 'Transfer Governance Token',
  ADD_MEMBER = 'Add Member',
  REMOVE_MEMBER = 'Remove Member'
}

type ProposalSettings = {
  title: string;
  icon: IconNamesType;
};

export interface ProposalCardProps {
  proposal: ProposalMeta;
  currentBlock: number | null;
}

const getProposalSettings = (proposalKind: ProposalKind): ProposalSettings => {
  switch (proposalKind.__typename) {
    case 'AddMember': {
      return {
        title: ProposalEnum.ADD_MEMBER,
        icon: 'user-add'
      };
    }
    case 'RemoveMember': {
      return {
        title: ProposalEnum.REMOVE_MEMBER,
        icon: 'user-delete'
      };
    }
    case 'Spend': {
      return {
        title: ProposalEnum.TRANSFER,
        icon: 'transfer'
      };
    }
    case 'TransferToken': {
      return {
        title: ProposalEnum.TRANSFER_GOVERNANCE_TOKEN,
        icon: 'token'
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

export function ProposalCard({ proposal, currentBlock }: ProposalCardProps) {
  const api = useAtomValue(apiAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const accounts = useAtomValue(accountsAtom);
  const { title, icon } = getProposalSettings(proposal.kind);
  const daoCollectiveContract = useDaoCollectiveContract();
  const currentDao = useAtomValue(currentDaoAtom);

  const { data } = useSubscription<SubscribeVotesByProposalId>(
    SUBSCRIBE_VOTES_BY_PROPOSAL_ID,
    {
      variables: { proposalId: proposal.id }
    }
  );

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
    if (!metamaskAccount) {
      return;
    }

    try {
      await daoCollectiveContract
        ?.connect(metamaskAccount)
        .vote(proposal.dao.id, proposal.hash, proposal.index, true);
      toast.success(
        <Notification
          title="Vote created"
          body="You've voted Aye for proposal."
          variant="success"
        />
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);

      toast.error(
        <Notification
          title="Transaction declined"
          body="Transaction was declined."
          variant="error"
        />
      );
    }
  };

  const handleVoteNo = async () => {
    if (!metamaskAccount) {
      return;
    }

    try {
      await daoCollectiveContract
        ?.connect(metamaskAccount)
        .vote(proposal.dao.id, proposal.hash, proposal.index, false);
      toast.success(
        <Notification
          title="Vote created"
          body="You've voted Nay for proposal."
          variant="success"
        />
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);

      toast.error(
        <Notification
          title="Transaction declined"
          body="Transaction was declined."
          variant="error"
        />
      );
    }
  };

  const handleProposalFinish = async () => {
    if (!metamaskAccount) {
      return;
    }

    try {
      await daoCollectiveContract
        ?.connect(metamaskAccount)
        .close(
          proposal.dao.id,
          proposal.hash,
          proposal.index,
          100000000000,
          10000
        );
      toast.success(
        <Notification
          title="Proposal closed"
          body="Proposal will be closed soon."
          variant="success"
        />
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);

      toast.error(
        <Notification
          title="Transaction declined"
          body="Transaction was declined."
          variant="error"
        />
      );
    }
  };

  const onFinishSuccess = () => {
    toast.success(
      <Notification
        title="Proposal closed"
        body="Proposal will be closed soon."
        variant="success"
      />
    );
  };

  const onAyeVoteSuccess: TxCallback = () => {
    toast.success(
      <Notification
        title="Vote created"
        body="You've voted Aye for proposal."
        variant="success"
      />
    );
  };

  const onNayVoteSuccess: TxCallback = () => {
    toast.success(
      <Notification
        title="Vote created"
        body="You've voted Nay for proposal."
        variant="success"
      />
    );
  };

  const disabled = proposal.status !== 'Open';
  const ayes = data?.voteHistories.filter((_vote) => _vote.approvedVote).length;
  const nays = data?.voteHistories.filter(
    (_vote) => !_vote.approvedVote
  ).length;

  return (
    <Card className={styles['proposal-card']}>
      <div className={styles['proposal-title-container']}>
        <Icon name={icon} className={styles['proposal-icon']} />
        <span className={styles['proposal-title-items']}>
          <span className={styles['proposal-title-item']}>
            <Typography variant="title4">{title}</Typography>
          </span>
          {currentDao && currentBlock && (
            <span className={styles['proposal-title-item-countdown']}>
              <Countdown
                end={
                  (proposal.blockNum +
                    currentDao.policy.proposalPeriod -
                    currentBlock) *
                  1000 *
                  appConfig.expectedBlockTimeInSeconds
                }
                typography="value5"
              />
              <Typography variant="caption2">left</Typography>
            </span>
          )}
        </span>
      </div>

      <div className={styles['proposal-bottom-container']}>
        {(proposal.kind.__typename === 'TransferToken' ||
          proposal.kind.__typename === 'Spend') && (
          <span className={styles['proposal-transfer-container']}>
            <span className={styles['proposal-transfer-info']}>
              <Typography variant="caption3">Amount</Typography>
              <Typography variant="title5">
                {new Intl.NumberFormat('en-US', {
                  minimumFractionDigits: 2
                }).format(proposal.kind.amount)}
              </Typography>
            </span>
            <span className={styles['proposal-transfer-info']}>
              <Typography variant="caption3">Target</Typography>
              <Typography variant="title5">
                {(accounts?.find(
                  (_account) =>
                    _account.address ===
                    (proposal.kind as SpendProposal | TransferProposal)
                      .beneficiary
                )?.meta.name as string) ?? proposal.kind.beneficiary}
              </Typography>
            </span>
          </span>
        )}
        {(proposal.kind.__typename === 'AddMember' ||
          proposal.kind.__typename === 'RemoveMember') && (
          <span className={styles['proposal-member-info']}>
            <Typography variant="caption3">Member</Typography>
            <span className={styles['proposal-member-address']}>
              <Icon name="user-profile" size="xs" />
              <Typography variant="title5">
                {(accounts?.find(
                  (_account) =>
                    _account.address ===
                    (proposal.kind as AddMemberProposal | RemoveMemberProposal)
                      .who
                )?.meta.name as string) ?? proposal.kind.who}
              </Typography>
            </span>
          </span>
        )}
        <span className={styles['proposal-vote-buttons']}>
          <span className={styles['proposal-vote-button-container']}>
            {metamaskAccount ? (
              <Button
                variant="ghost"
                disabled={disabled}
                className={styles['button-vote']}
                onClick={handleVoteNo}
              >
                <Icon name="vote-no" />
              </Button>
            ) : (
              <TxButton
                disabled={disabled}
                accountId={substrateAccount?.address}
                tx={api?.tx.daoCouncil.vote}
                variant="ghost"
                params={[proposal.dao.id, proposal.hash, proposal.index, false]}
                className={styles['button-vote']}
                onSuccess={onNayVoteSuccess}
              >
                <Icon name="vote-no" />
              </TxButton>
            )}

            <Typography variant="caption2">{nays || 0}</Typography>
          </span>

          <div className={styles['vertical-break']} />
          <span className={styles['proposal-vote-button-container']}>
            {metamaskAccount ? (
              <Button
                variant="ghost"
                disabled={disabled}
                className={styles['button-vote']}
                onClick={handleVoteYes}
              >
                <Icon name="vote-yes" />
              </Button>
            ) : (
              <TxButton
                disabled={disabled}
                accountId={substrateAccount?.address}
                tx={api?.tx.daoCouncil.vote}
                params={[proposal.dao.id, proposal.hash, proposal.index, true]}
                variant="ghost"
                className={styles['button-vote']}
                onSuccess={onAyeVoteSuccess}
              >
                <Icon name="vote-yes" />
              </TxButton>
            )}

            <Typography variant="caption2">{ayes || 0}</Typography>
          </span>
          {!disabled &&
            ayes !== undefined &&
            nays !== undefined &&
            (ayes >= proposal.voteThreshold ||
              nays >= proposal.voteThreshold) && (
              <>
                <div className={styles['vertical-break']} />
                <span className={styles['proposal-vote-button-container']}>
                  {metamaskAccount ? (
                    <Button
                      disabled={disabled}
                      variant="ghost"
                      className={styles['button-vote']}
                      onClick={handleProposalFinish}
                    >
                      <Icon name="send" />
                    </Button>
                  ) : (
                    <TxButton
                      disabled={disabled}
                      accountId={substrateAccount?.address}
                      tx={api?.tx.daoCouncil.close}
                      params={[
                        proposal.dao.id,
                        proposal.hash,
                        proposal.index,
                        proposalWeightBound,
                        LENGTH_BOUND
                      ]}
                      variant="ghost"
                      className={styles['button-vote']}
                      onSuccess={onFinishSuccess}
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
