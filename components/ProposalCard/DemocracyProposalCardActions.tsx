import { useState } from 'react';
import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import { currentDaoAtom } from 'store/dao';
import { metamaskAccountAtom, substrateAccountAtom } from 'store/account';

import { evmToAddress } from '@polkadot/util-crypto';
import { formatBalance } from '@polkadot/util';
import { useSubscription } from '@apollo/client';
import SUBSCRIBE_DEMOCRACY_SECONDS_BY_PROPOSAL_ID from 'query/subscribeDemocracySecondsByProposalId.graphql';
import { useDaoDemocracyContract } from 'hooks/useDaoDemocracyContract';

import type {
  DemocracyProposalMeta,
  SubscribeDemocracySecondsByProposalId,
  TxFailedCallback
} from 'types';

import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { TxButton } from 'components/TxButton';
import { Notification } from 'components/ui-kit/Notifications';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from 'components/ui-kit/Dialog';

import styles from './ProposalCard.module.scss';

type DemocracyProposalCardActionsProps = {
  proposal: DemocracyProposalMeta;
};

export function DemocracyProposalCardActions({
  proposal
}: DemocracyProposalCardActionsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const daoDemocracyContract = useDaoDemocracyContract();

  const { data } = useSubscription<SubscribeDemocracySecondsByProposalId>(
    SUBSCRIBE_DEMOCRACY_SECONDS_BY_PROPOSAL_ID,
    {
      variables: {
        proposalId: proposal.id
      }
    }
  );

  const api = useAtomValue(apiAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);

  const onSuccess = () => {
    toast.success(
      <Notification
        title="Second closed"
        body="You've seconded for proposal."
        variant="success"
      />
    );
    setModalOpen(false);
  };

  const secondsUpperBound =
    data?.democracySeconds.reduce(
      (acc, _democracySecond) => acc + _democracySecond.count,
      1
    ) || 1;

  const handleProposalSecond = async () => {
    if (!metamaskAccount || !data) {
      return;
    }

    await daoDemocracyContract
      ?.connect(metamaskAccount)
      .second(proposal.dao.id, proposal.index, secondsUpperBound);

    onSuccess();
  };

  const disabled = false;

  const handleCancelClick = () => setModalOpen(false);

  const onFailed: TxFailedCallback = () => {
    // eslint-disable-next-line no-console
    toast.error(
      <Notification
        title="Transaction failed"
        body="Transaction failed"
        variant="error"
      />
    );
  };

  const times = data?.democracySeconds.find((_democracySecond) => {
    if (metamaskAccount && metamaskAccount._address) {
      return (
        _democracySecond.seconder.id === evmToAddress(metamaskAccount._address)
      );
    }

    if (substrateAccount) {
      return _democracySecond.seconder.id === substrateAccount.address;
    }

    return null;
  })?.count;

  const lockedBalance = BigInt(proposal.deposit) * BigInt(secondsUpperBound);

  return (
    <div className={styles['democracy-proposal-actions']}>
      <div className={styles['democracy-deposit']}>
        <Typography variant="caption2">Locked balance:</Typography>
        <span className={styles['democracy-deposit-amount']}>
          <Typography variant="value3">
            {formatBalance(lockedBalance, {
              decimals: currentDao?.fungibleToken.decimals,
              withSi: false,
              forceUnit: '-'
            })}
          </Typography>
          <Typography variant="title4">
            {currentDao?.fungibleToken.symbol}
          </Typography>
        </span>
      </div>
      <div className={styles['second-container']}>
        {times && (
          <Typography variant="caption2">
            You have already <br /> seconded&nbsp;
            <span className={styles.bold}>{times}</span>{' '}
            {times === 1 ? 'time' : 'times'}
          </Typography>
        )}
        {proposal.status === 'Open' && (
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button variant="filled">Second</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogTitle asChild>
                <Typography variant="title1">
                  Tokens required to second the proposal
                </Typography>
              </DialogTitle>

              <DialogDescription asChild>
                <>
                  <div className={styles['democracy-modal-deposit-container']}>
                    <span className={styles['democracy-modal-deposit']}>
                      <Typography variant="title4">
                        {proposal.deposit}
                      </Typography>
                      <Typography variant="body2">
                        {currentDao?.fungibleToken.symbol}
                      </Typography>
                    </span>
                  </div>
                  <div className={styles['buttons-container']}>
                    <Button
                      variant="outlined"
                      color="destructive"
                      className={styles['democracy-modal-button']}
                      onClick={handleCancelClick}
                    >
                      Cancel
                    </Button>
                    {metamaskAccount ? (
                      <Button
                        className={styles['democracy-modal-button']}
                        disabled={disabled}
                        variant="filled"
                        onClick={handleProposalSecond}
                      >
                        Second
                      </Button>
                    ) : (
                      <TxButton
                        className={styles['democracy-modal-button']}
                        disabled={disabled}
                        accountId={substrateAccount?.address}
                        tx={api?.tx.daoDemocracy.second}
                        params={[proposal.dao.id, proposal.index]}
                        variant="filled"
                        onSuccess={onSuccess}
                        onFailed={onFailed}
                      >
                        Second
                      </TxButton>
                    )}
                  </div>
                </>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
