import { useState } from 'react';
import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import { currentDaoAtom } from 'store/dao';
import { metamaskAccountAtom, substrateAccountAtom } from 'store/account';

import type { DemocracyProposalMeta } from 'types';

import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
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

  const api = useAtomValue(apiAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);

  const handleProposalSecond = () => {};

  const disabled = false;

  const onFinishSuccess = () => {
    toast.success(
      <Notification
        title="Proposal closed"
        body="Proposal will be closed soon."
        variant="success"
      />
    );
  };

  const handleCancelClick = () => setModalOpen(false);

  return (
    <div className={styles['democracy-proposal-actions']}>
      <div className={styles['democracy-deposit']}>
        <Typography variant="caption2">Locked balance:</Typography>
        <span className={styles['democracy-deposit-amount']}>
          <Typography variant="value3">{proposal.deposit}</Typography>
          <Typography variant="title4">
            {currentDao?.fungibleToken.symbol}
          </Typography>
        </span>
      </div>
      <div>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button variant="filled">Second</Button>
          </DialogTrigger>

          <DialogContent closeIcon={false}>
            <DialogTitle asChild>
              <Typography variant="title1">
                Tokens required to second the proposal
              </Typography>
            </DialogTitle>

            <DialogDescription>
              <div className={styles['democracy-modal-deposit-container']}>
                <span className={styles['democracy-modal-deposit']}>
                  <Typography variant="title4">{proposal.deposit}</Typography>
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
                    onSuccess={onFinishSuccess}
                  >
                    Second
                  </TxButton>
                )}
              </div>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
