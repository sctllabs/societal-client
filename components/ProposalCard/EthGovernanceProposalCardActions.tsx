import { ChangeEventHandler, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { metamaskAccountAtom } from 'store/account';
import { apiAtom } from 'store/api';
import { tokenDecimalsAtom } from 'store/token';
import { eventsAtom } from 'store/events';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_VOTES_BY_PROPOSAL_ID from 'query/subscribeEthGovernanceVotesByProposalId.graphql';

import type {
  EthGovernanceProposalMeta,
  EthGovernanceVoteHistory,
  SubscribeEthVotesByProposalId
} from 'types';
import { extractErrorFromString } from 'utils/errors';
import { convertTokenAmount } from 'utils/convertTokenAmount';
import usePrevious from 'utils/usePrevious';

import { Button } from 'components/ui-kit/Button';
import { Typography } from 'components/ui-kit/Typography';
import { Notification } from 'components/ui-kit/Notifications';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from 'components/ui-kit/Dialog';

import { useDaoEthGovernanceContract } from 'hooks/useDaoEthGovernanceContract';
import { stringToHex } from '@polkadot/util';
import { Input } from 'components/ui-kit/Input';
import { Icon } from 'components/ui-kit/Icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from 'components/ui-kit/Tooltip';
import { InputLabel, InputName } from 'components/CreateProposal/types';

import styles from './ProposalCard.module.scss';
import { VoteProgress } from './VoteProgress';

type EthGovernanceProposalActionsProps = {
  proposal: EthGovernanceProposalMeta;
};

type VOTE_STATE = {
  amount: string;
};

const INITIAL_STATE: VOTE_STATE = {
  amount: ''
};

export function EthGovernanceProposalActions({
  proposal
}: EthGovernanceProposalActionsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [voteState, setVoteState] = useState(INITIAL_STATE);
  const [votes, setVotes] = useState<EthGovernanceVoteHistory[] | null>([]);
  const prevVotes = usePrevious(votes);

  const api = useAtomValue(apiAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const daoEthGovernanceContract = useDaoEthGovernanceContract();
  const tokenDecimals = useAtomValue(tokenDecimalsAtom);
  const events = useAtomValue(eventsAtom);

  const daoEthGovernanceVotedEventSignature =
    api?.events.daoEthGovernance.Voted;

  useEffect(() => {
    setVoteState(INITIAL_STATE);
  }, [modalOpen]);

  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name;
    const targetValue = target.value;

    setVoteState((prevState) => ({
      ...prevState,
      [targetName]:
        targetName === InputName.AMOUNT
          ? targetValue.replace(/[^0-9]/g, '')
          : targetValue
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data } = useSubscription<SubscribeEthVotesByProposalId>(
    SUBSCRIBE_VOTES_BY_PROPOSAL_ID,
    {
      variables: { proposalId: proposal.id }
    }
  );

  useEffect(() => {
    const ethGovernanceVotedEvents = events
      ?.filter(
        (r) => r.event && daoEthGovernanceVotedEventSignature?.is(r.event)
      )
      .map((e) => e.toHuman())
      .filter(
        ({ event }) =>
          `${(event as any)?.data?.daoId}-${
            (event as any)?.data?.proposalIndex
          }` === proposal.id
      );

    const accounts: string[] = [];

    let voteAggregator =
      data?.ethGovernanceVoteHistories.map((voteHistory) => {
        const { account, blockNum } = voteHistory;
        const { id } = account;

        accounts.push(id);

        const voteEvent = ethGovernanceVotedEvents?.find(
          ({ event }) => id === (event as any)?.data.account
        );

        const prevVote = (prevVotes as any)?.find(
          (vote: { blockNum: number }) => vote.blockNum === blockNum
        );

        if (voteEvent) {
          const { data: voteData } = (voteEvent.event as any) || [];
          const { aye, balance } = (voteData as any)?.vote || {};

          return {
            ...voteHistory,
            aye,
            balance
          };
        }

        return prevVote || voteHistory;
      }) || [];

    const newVotes =
      ethGovernanceVotedEvents
        ?.filter(
          ({ event }) => !accounts.includes((event as any)?.data.account)
        )
        .map((event) => {
          const { data: voteData } = (event.event as any) || [];
          const { daoId, proposalIndex, account, vote } = voteData || {};
          const { aye, balance } = vote || {};

          accounts.push(account);

          return {
            id: `${daoId}-${proposalIndex}-${account}`,
            account: { id: account },
            aye,
            balance: (balance as string).includes(',')
              ? balance.replaceAll(',', '')
              : balance,
            blockNum: undefined,
            __typename: 'EthGovernanceVoteHistory'
          };
        }) || [];
    if (newVotes.length) {
      voteAggregator = voteAggregator.concat(newVotes);
    }

    const oldPendingVotes =
      (prevVotes as any)?.filter(
        (vote: { account: { id: string } }) =>
          !accounts.includes(vote.account.id)
      ) || [];
    if (oldPendingVotes.length) {
      voteAggregator = voteAggregator.concat(oldPendingVotes);
    }

    if (!voteAggregator.length) {
      return;
    }

    setVotes(voteAggregator);
  }, [events, data, proposal, prevVotes, daoEthGovernanceVotedEventSignature]);

  const ayes =
    votes
      ?.filter((x) => x.aye)
      .reduce((acc, vote) => acc + Number(vote.balance), 0) ?? 0;
  const nays =
    votes
      ?.filter((x) => !x.aye)
      .reduce((acc, vote) => acc + Number(vote.balance), 0) ?? 0;

  const handleVote = async (aye: boolean) => {
    if (!metamaskAccount) {
      return;
    }

    try {
      await daoEthGovernanceContract
        ?.connect(metamaskAccount)
        .vote(
          proposal.dao.id,
          proposal.hash,
          proposal.index,
          aye,
          convertTokenAmount(voteState.amount, tokenDecimals || 0),
          stringToHex(metamaskAccount?._address)
        );
      toast.success(
        <Notification
          title="Vote created"
          body={`You've voted ${aye ? 'Aye' : 'Nay'} for proposal.`}
          variant="success"
        />
      );
      setModalOpen(false);
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

  const disabled = proposal.status !== 'Open';

  const handleCancelClick = () => setModalOpen(false);

  const proposalStatus = useMemo(() => {
    switch (proposal.status) {
      case 'Approved':
        return 'Approved';
      case 'Disapproved':
        return 'Failed';
      case 'Executed': {
        return proposal.executed ? 'Approved' : 'Failed';
      }
      case 'Pending':
        return 'Pending';
      default: {
        return null;
      }
    }
  }, [proposal.executed, proposal.status]);

  return (
    <div className={styles['eth-governance-proposal-actions']}>
      {proposal.status === 'Open' && (
        <>
          <VoteProgress ayes={ayes} nays={nays} />
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button variant="filled">Vote</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogTitle asChild>
                <Typography variant="title1">
                  Enter the number of tokens that you want to vote with
                </Typography>
              </DialogTitle>

              <DialogDescription asChild>
                <>
                  <Input
                    name={InputName.AMOUNT}
                    label={InputLabel.AMOUNT}
                    value={voteState.amount}
                    onChange={onInputChange}
                    type="tel"
                    required
                  />
                  <div className={styles['buttons-container']}>
                    <Button
                      variant="outlined"
                      color="destructive"
                      className={styles['democracy-modal-button']}
                      onClick={handleCancelClick}
                    >
                      Cancel
                    </Button>
                    <Button
                      className={styles['democracy-modal-button']}
                      disabled={disabled}
                      variant="filled"
                      onClick={() => handleVote(false)}
                    >
                      Nay
                    </Button>
                    <Button
                      className={styles['democracy-modal-button']}
                      disabled={disabled}
                      variant="filled"
                      onClick={() => handleVote(true)}
                    >
                      Aye
                    </Button>
                  </div>
                </>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </>
      )}
      {proposal.status !== 'Open' && (
        <div className={styles['eth-status-container']}>
          <div
            className={clsx(
              styles['referendum-status'],
              proposalStatus && styles[proposalStatus.toLowerCase()]
            )}
          >
            <Typography variant="button1">{proposalStatus}</Typography>
            {proposal.__typename === 'EthGovernanceProposal' &&
            proposalStatus === 'Failed' ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Icon
                        className={styles['hint-logo-icon']}
                        name="noti-info-stroke"
                        size="xs"
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {proposal.status === 'Disapproved'
                      ? 'Disapproved'
                      : extractErrorFromString(api, proposal.reason)}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
