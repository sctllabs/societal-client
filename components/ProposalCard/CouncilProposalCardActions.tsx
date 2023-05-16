import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { metamaskAccountAtom, substrateAccountAtom } from 'store/account';
import { apiAtom } from 'store/api';
import { eventsAtom } from 'store/events';

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
  CouncilVoteHistory,
  SubscribeCouncilVotesByProposalId,
  TxCallback,
  TxFailedCallback
} from 'types';

import { TxButton } from 'components/TxButton';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Typography } from 'components/ui-kit/Typography';
import { Notification } from 'components/ui-kit/Notifications';
import { extractError } from 'utils/errors';
import usePrevious from 'utils/usePrevious';

import styles from './ProposalCard.module.scss';

type CouncilProposalActionsProps = { proposal: CouncilProposalMeta };

export function CouncilProposalActions({
  proposal
}: CouncilProposalActionsProps) {
  const [votes, setVotes] = useState<CouncilVoteHistory[] | null>([]);
  const prevVotes = usePrevious(votes);

  const api = useAtomValue(apiAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const daoCollectiveContract = useDaoCollectiveContract();
  const events = useAtomValue(eventsAtom);

  const daoCouncilVotedEventSignature = api?.events.daoCouncil.Voted;

  const { data } = useSubscription<SubscribeCouncilVotesByProposalId>(
    SUBSCRIBE_VOTES_BY_PROPOSAL_ID,
    {
      variables: { proposalId: proposal.id }
    }
  );

  useEffect(() => {
    const councilVotedEvents = events
      ?.filter((r) => r.event && daoCouncilVotedEventSignature?.is(r.event))
      .map((e) => e.toHuman())
      .filter(
        ({ event }) =>
          `${(event as any)?.data?.daoId}-${
            (event as any)?.data?.proposalIndex
          }` === proposal.id
      );

    setVotes(
      data?.councilVoteHistories.map((voteHistory) => {
        const { councillor, blockNum } = voteHistory;
        const { id } = councillor;

        const voteEvent = councilVotedEvents?.find(
          ({ event }) => id === (event as any)?.data.account
        );

        const prevVote = (prevVotes as any)?.find(
          (vote: { blockNum: number }) => vote.blockNum === blockNum
        );

        if (voteEvent) {
          const { data: voteData } = (voteEvent.event as any) || [];

          return {
            ...voteHistory,
            votedYes: voteData?.yes,
            votedNo: voteData?.no,
            approvedVote: !!parseInt(voteData?.yes as string, 10) || false
          };
        }

        return prevVote || voteHistory;
      }) as any
    );
  }, [events, data, proposal, prevVotes, daoCouncilVotedEventSignature]);

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

  const onFailed: TxFailedCallback = (result) => {
    toast.error(
      <Notification
        title="Transaction declined"
        body={extractError(api, result)}
        variant="error"
      />
    );
  };

  const disabled = proposal.status !== 'Open';
  const disabledFinish =
    proposal.status === 'Executed' || proposal.status === 'Pending';
  const ayes = votes?.filter((_vote) => _vote.approvedVote).length;
  const nays = votes?.filter((_vote) => !_vote.approvedVote).length;

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
            onFailed={onFailed}
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
            onFailed={onFailed}
          >
            <Icon name="vote-yes" />
          </TxButton>
        )}

        <Typography variant="caption2">{ayes || 0}</Typography>
      </span>
      {proposal.status !== 'Executed' &&
        ayes !== undefined &&
        nays !== undefined &&
        (ayes >= proposal.voteThreshold || nays >= proposal.voteThreshold) && (
          <>
            <div className={styles['vertical-break']} />
            <span className={styles['proposal-vote-button-container']}>
              {metamaskAccount ? (
                <Button
                  disabled={disabledFinish}
                  variant="ghost"
                  className={styles['button-vote']}
                  onClick={handleProposalFinish}
                >
                  <Icon name="send" />
                </Button>
              ) : (
                <TxButton
                  disabled={disabledFinish}
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
                  onFailed={(result) => onFailed(result)}
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
