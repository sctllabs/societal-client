import { useMemo } from 'react';
import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { metamaskAccountAtom, substrateAccountAtom } from 'store/account';
import { apiAtom } from 'store/api';

import { useDaoCollectiveContract } from 'hooks/useDaoCollectiveContract';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_VOTES_BY_PROPOSAL_ID from 'query/subscribeCouncilVotesByProposalId.graphql';

import {
  LENGTH_BOUND,
  PROPOSAL_WEIGHT_BOUND,
  PROPOSAL_WEIGHT_BOUND_OLD,
  PROPOSAL_WEIGHT_KEY,
  PROPOSAL_WEIGHT_TYPE
} from 'constants/transaction';
import type {
  CouncilProposalMeta,
  SubscribeCouncilVotesByProposalId,
  TxCallback
} from 'types';

import { TxButton } from 'components/TxButton';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Typography } from 'components/ui-kit/Typography';
import { Notification } from 'components/ui-kit/Notifications';

import styles from './ProposalCard.module.scss';

type CouncilProposalActionsProps = { proposal: CouncilProposalMeta };

export function CouncilProposalActions({
  proposal
}: CouncilProposalActionsProps) {
  const api = useAtomValue(apiAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const daoCollectiveContract = useDaoCollectiveContract();

  const { data } = useSubscription<SubscribeCouncilVotesByProposalId>(
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
  const ayes = data?.councilVoteHistories.filter(
    (_vote) => _vote.approvedVote
  ).length;
  const nays = data?.councilVoteHistories.filter(
    (_vote) => !_vote.approvedVote
  ).length;

  return (
    <div className={styles['proposal-vote-buttons']}>
      <div className={styles['proposal-vote-button-container']}>
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
      </div>

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
        (ayes >= proposal.voteThreshold || nays >= proposal.voteThreshold) && (
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
    </div>
  );
}
