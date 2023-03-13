import { useState } from 'react';
import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { metamaskAccountAtom, substrateAccountAtom } from 'store/account';
import { apiAtom } from 'store/api';
import { currentDaoAtom } from 'store/dao';

import { useDaoDemocracyContract } from 'hooks/useDaoDemocracyContract';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from 'components/ui-kit/Dialog';
import { Button } from 'components/ui-kit/Button';
import { Typography } from 'components/ui-kit/Typography';
import { Notification } from 'components/ui-kit/Notifications';
import { TxButton } from 'components/TxButton';

import styles from './Referendum.module.scss';

export function UndelegateModal() {
  const [modalOpen, setModalOpen] = useState(false);
  const api = useAtomValue(apiAtom);

  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const currentDao = useAtomValue(currentDaoAtom);

  const daoDemocracyContract = useDaoDemocracyContract();
  const extrinsic = api?.tx.daoDemocracy.undelegate;

  const handleCancelClick = () => setModalOpen(false);

  const onSuccess = () => {
    toast.success(
      <Notification
        title="Undelegated"
        body="Votes were undelegated."
        variant="success"
      />
    );
    setModalOpen(false);
  };

  const handleDelegateClick = async () => {
    if (!metamaskAccount || !currentDao) {
      return;
    }

    try {
      await daoDemocracyContract
        ?.connect(metamaskAccount)
        .undelegate(currentDao.id);
      onSuccess();
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

  const handleTransform = () => [currentDao?.id];

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button color="destructive" variant="text">
          Undelegate
        </Button>
      </DialogTrigger>
      <DialogContent className={styles['dialog-content']} closeIcon={false}>
        <DialogTitle asChild>
          <Typography className={styles.title} variant="title1">
            Undelegate votes
          </Typography>
        </DialogTitle>
        <DialogDescription asChild>
          <div className={styles['undelegate-description']}>
            <Typography variant="body1">
              Are you sure you want to undelegate all the delegations that are
              available?
            </Typography>
            <div className={styles['buttons-container']}>
              <Button
                variant="outlined"
                color="destructive"
                onClick={handleCancelClick}
              >
                Cancel
              </Button>

              {metamaskAccount ? (
                <Button color="destructive" onClick={handleDelegateClick}>
                  Undelegate
                </Button>
              ) : (
                <TxButton
                  color="destructive"
                  accountId={substrateAccount?.address}
                  params={handleTransform}
                  tx={extrinsic}
                  onSuccess={onSuccess}
                >
                  Undelegate
                </TxButton>
              )}
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
