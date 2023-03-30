import { ChangeEventHandler, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { metamaskAccountAtom } from 'store/account';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_VOTES_BY_PROPOSAL_ID from 'query/subscribeCouncilVotesByProposalId.graphql';

import type {
  EthGovernanceProposalMeta,
  SubscribeCouncilVotesByProposalId
} from 'types';

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
import { InputLabel, InputName } from 'components/CreateProposal/types';

import styles from './ProposalCard.module.scss';

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

  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const daoEthGovernanceContract = useDaoEthGovernanceContract();

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
  const { data } = useSubscription<SubscribeCouncilVotesByProposalId>(
    SUBSCRIBE_VOTES_BY_PROPOSAL_ID,
    {
      variables: { proposalId: proposal.id }
    }
  );

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
          voteState.amount,
          stringToHex(metamaskAccount?._address)
        );
      toast.success(
        <Notification
          title="Vote created"
          body={`You've voted ${aye ? 'Aye' : 'Nay'} for proposal.`}
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

  const disabled = proposal.status !== 'Open';

  const handleCancelClick = () => setModalOpen(false);

  return (
    <div className={styles['eth-governance-proposal-actions']}>
      {proposal.status === 'Open' && (
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
      )}
    </div>
  );
}
