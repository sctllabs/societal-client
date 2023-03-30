import { ChangeEventHandler, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { formatDistance } from 'date-fns';
import { useAtomValue } from 'jotai';
import { metamaskAccountAtom, substrateAccountAtom } from 'store/account';
import { apiAtom } from 'store/api';

import { ConvictionOptions, ConvictionToEth } from 'constants/conviction';
import { useDaoDemocracyContract } from 'hooks/useDaoDemocracyContract';
import type { DemocracyReferendumMeta, GovernanceV1 } from 'types';

import { Notification } from 'components/ui-kit/Notifications';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from 'components/ui-kit/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from 'components/ui-kit/Select';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Input } from 'components/ui-kit/Input';
import { Icon } from 'components/ui-kit/Icon';
import { TxButton } from 'components/TxButton';

import { appConfig } from 'config';
import { currentDaoAtom } from 'store/dao';

import styles from './ProposalCard.module.scss';

type DemocracyReferendumVoteModalProps = {
  proposal: DemocracyReferendumMeta;
};

enum InputLabel {
  AMOUNT = 'Amount',
  CONVICTION = 'Set the vote conviction, which determines its weight'
}

enum InputName {
  AMOUNT = 'amount'
}

type VOTE_STATE = {
  amount: string;
  conviction: string;
};

const INITIAL_STATE: VOTE_STATE = {
  amount: '',
  conviction: ''
};

export function DemocracyReferendumVoteModal({
  proposal
}: DemocracyReferendumVoteModalProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [voteState, setVoteState] = useState(INITIAL_STATE);

  const currentDao = useAtomValue(currentDaoAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const api = useAtomValue(apiAtom);

  const daoDemocracyContract = useDaoDemocracyContract();

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

  const onConvictionValueChange = (conviction: string) =>
    setVoteState((prevState) => ({ ...prevState, conviction }));

  const disabled = !api;

  const onSuccess = () => {
    toast.success(
      <Notification title="Voted" body="You have voted." variant="success" />
    );
    setModalOpen(false);
  };

  const onFailed = () =>
    toast.error(
      <Notification
        title="Transaction failed"
        body="Transaction Failed"
        variant="error"
      />
    );

  const handleProposalSecond = async (approvedVote: boolean) => {
    if (!metamaskAccount) {
      return;
    }

    try {
      await daoDemocracyContract
        ?.connect(metamaskAccount)
        .standardVote(
          proposal.dao.id,
          proposal.index,
          approvedVote,
          voteState.amount,
          voteState.conviction
        );
      onSuccess();
    } catch (e) {
      onFailed();
    }
  };

  const handleProposalSecondAye = () => handleProposalSecond(true);

  const handleProposalSecondNay = () => handleProposalSecond(false);

  const handleTransform = (aye: boolean) => {
    const vote = {
      Standard: {
        vote: {
          aye,
          conviction: voteState.conviction
        },
        balance: voteState.amount
      }
    };
    return [proposal.dao.id, proposal.index, vote];
  };

  const handleTransformAye = () => handleTransform(true);
  const handleTransformNay = () => handleTransform(false);

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button variant="filled">Vote</Button>
      </DialogTrigger>

      <DialogContent closeIcon>
        <DialogTitle asChild>
          <Typography variant="title1">Voting process</Typography>
        </DialogTitle>

        <DialogDescription asChild>
          <div className={styles['referendum-description-container']}>
            <Typography variant="body1">
              Enter the number of tokens that you want to vote with
            </Typography>

            <Input
              name={InputName.AMOUNT}
              label={InputLabel.AMOUNT}
              value={voteState.amount}
              onChange={onInputChange}
              type="tel"
              required
            />

            <Select onValueChange={onConvictionValueChange}>
              <SelectTrigger>
                <SelectValue placeholder={InputLabel.CONVICTION} />
              </SelectTrigger>
              <SelectContent>
                {/* TODO: @asansyzb avoid copy-pasting - see DelegateModal */}
                {Object.entries(ConvictionOptions).map(
                  ([convictionOption, convictionValue]) => {
                    const duration =
                      ConvictionToEth[convictionValue] *
                      ((
                        currentDao?.policy.governance as GovernanceV1
                      ).enactmentPeriod.valueOf() || 0) *
                      appConfig.expectedBlockTimeInSeconds *
                      1000;

                    return (
                      <SelectItem
                        value={convictionValue}
                        key={convictionOption}
                      >
                        {/* TODO: @asansyzb Format duration */}
                        <Typography variant="body2">
                          {convictionOption}
                          {duration > 0 && ` (${formatDistance(0, duration)})`}
                        </Typography>
                      </SelectItem>
                    );
                  }
                )}
              </SelectContent>
            </Select>

            <div className={styles['buttons-container']}>
              {metamaskAccount ? (
                <>
                  <Button
                    className={styles['democracy-modal-button']}
                    disabled={disabled}
                    variant="filled"
                    onClick={handleProposalSecondNay}
                  >
                    Vote Nay
                  </Button>
                  <Button
                    className={styles['democracy-modal-button']}
                    disabled={disabled}
                    variant="filled"
                    onClick={handleProposalSecondAye}
                  >
                    Vote Aye
                  </Button>
                </>
              ) : (
                <>
                  <TxButton
                    className={styles['democracy-modal-button']}
                    disabled={disabled}
                    accountId={substrateAccount?.address}
                    tx={api?.tx.daoDemocracy.vote}
                    params={handleTransformNay}
                    variant="vote"
                    onSuccess={onSuccess}
                    color="destructive"
                    onFailed={onFailed}
                  >
                    <Typography variant="button1">Vote Nay</Typography>
                    <Icon name="vote-no" size="xs" />
                  </TxButton>
                  <TxButton
                    className={styles['democracy-modal-button']}
                    disabled={disabled}
                    accountId={substrateAccount?.address}
                    tx={api?.tx.daoDemocracy.vote}
                    params={handleTransformAye}
                    variant="vote"
                    color="success"
                    onSuccess={onSuccess}
                    onFailed={onFailed}
                  >
                    <Typography variant="button1">Vote Aye</Typography>
                    <Icon name="vote-yes" size="xs" />
                  </TxButton>
                </>
              )}
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
