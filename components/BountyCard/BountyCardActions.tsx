import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAtomValue } from 'jotai';
import { formatBalance } from '@polkadot/util';
import { evmToAddress } from '@polkadot/util-crypto';

import { apiAtom, chainDecimalsAtom, chainSymbolAtom } from 'store/api';
import { metamaskAccountAtom, substrateAccountAtom } from 'store/account';
import { tokenDecimalsAtom, tokenSymbolAtom } from 'store/token';

import type { BountyMeta } from 'types';

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
import { CreateProposal } from 'components/CreateProposal';
import { BountyProposalEnum } from 'components/CreateProposal/types';

import styles from './BountyCard.module.scss';

type BountyCardActionsProps = {
  bounty: BountyMeta;
};

export function BountyCardActions({ bounty }: BountyCardActionsProps) {
  const api = useAtomValue(apiAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const chainSymbol = useAtomValue(chainSymbolAtom);
  const tokenSymbol = useAtomValue(tokenSymbolAtom);
  const chainDecimals = useAtomValue(chainDecimalsAtom);
  const tokenDecimals = useAtomValue(tokenDecimalsAtom);

  const [modalOpen, setModalOpen] = useState(false);

  const onSuccess = useCallback(() => {
    toast.success(
      <Notification
        title="Transaction"
        body="Transaction was accepted."
        variant="success"
      />
    );
    setModalOpen(false);
  }, []);

  const onFailed = useCallback(() => {
    toast.error(
      <Notification
        title="Transaction declined"
        body="Transaction was declined."
        variant="error"
      />
    );
  }, []);

  const handleModalOpen = (value: boolean) => setModalOpen(value);

  const handleUnassign = useCallback(() => {}, []);

  const handleAccept = useCallback(() => {}, []);

  const unassignButton = useMemo(() => {
    if (metamaskAccount) {
      return (
        <Button variant="outlined" onClick={handleUnassign}>
          Unassign
        </Button>
      );
    }

    return (
      <TxButton
        variant="outlined"
        accountId={substrateAccount?.address}
        params={[bounty.dao.id, bounty.index]}
        tx={api?.tx.daoBounties.unassignCurator}
        onSuccess={onSuccess}
        onFailed={onFailed}
      >
        Unassign
      </TxButton>
    );
  }, [
    api?.tx.daoBounties.unassignCurator,
    bounty.dao.id,
    bounty.index,
    handleUnassign,
    metamaskAccount,
    onFailed,
    onSuccess,
    substrateAccount?.address
  ]);

  const acceptButton = useMemo(() => {
    if (metamaskAccount) {
      return (
        <Button variant="filled" onClick={handleAccept}>
          Accept
        </Button>
      );
    }

    return (
      <TxButton
        accountId={substrateAccount?.address}
        params={[bounty.dao.id, bounty.index]}
        tx={api?.tx.daoBounties.acceptCurator}
        onSuccess={onSuccess}
        onFailed={onFailed}
      >
        Accept
      </TxButton>
    );
  }, [
    api?.tx.daoBounties.acceptCurator,
    bounty.dao.id,
    bounty.index,
    handleAccept,
    metamaskAccount,
    onFailed,
    onSuccess,
    substrateAccount?.address
  ]);

  const accountAddress = useMemo(() => {
    if (substrateAccount) {
      return substrateAccount.address;
    }
    if (metamaskAccount?._address) {
      return evmToAddress(metamaskAccount._address);
    }
    return null;
  }, [metamaskAccount, substrateAccount]);

  if (
    bounty.status !== 'CuratorProposed' &&
    bounty.status !== 'CuratorAccepted' &&
    bounty.status !== 'Created' &&
    bounty.status !== 'CuratorUnassigned' &&
    bounty.status !== 'BecameActive'
  ) {
    return null;
  }

  return (
    <div className={styles['actions-container']}>
      {(bounty.status === 'Created' ||
        bounty.status === 'CuratorUnassigned' ||
        bounty.status === 'BecameActive') && (
        <div className={styles['assign-curator']}>
          <CreateProposal
            proposalVariant="bounty"
            buttonText="Propose Curator"
            bountyIndex={bounty.index.toString()}
            proposalType={BountyProposalEnum.BOUNTY_CURATOR}
          />
        </div>
      )}
      {bounty.status === 'CuratorProposed' &&
        bounty.curator?.id === accountAddress && (
          <>
            <Typography variant="body2">
              You have been designated curator for this bounty
            </Typography>

            <div className={styles['buttons-container']}>
              {unassignButton}

              <Dialog open={modalOpen} onOpenChange={handleModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="filled">Accept</Button>
                </DialogTrigger>
                <DialogContent className={styles['dialog-content']}>
                  <DialogTitle asChild>
                    <Typography className={styles.title} variant="title1">
                      Accept the assignment
                    </Typography>
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className={styles['dialog-description']}>
                      <div className={styles['dialog-content']}>
                        <Typography variant="body1">
                          Upon accepting the assignment, your balance will be
                          deducted in the amount of
                        </Typography>
                        <div
                          className={
                            styles['democracy-modal-deposit-container']
                          }
                        >
                          <div className={styles['democracy-modal-deposit']}>
                            <Typography variant="title4">
                              {!Number.isNaN(bounty.fee)
                                ? formatBalance(
                                    bounty.fee?.replaceAll(',', '') || 0,
                                    {
                                      decimals:
                                        (bounty.nativeToken
                                          ? chainDecimals
                                          : tokenDecimals) || 0,
                                      withSi: false,
                                      forceUnit: '-'
                                    }
                                  )
                                : ''}
                            </Typography>
                            <Typography variant="body2">
                              {bounty.nativeToken ? chainSymbol : tokenSymbol}
                            </Typography>
                          </div>
                        </div>
                      </div>

                      {acceptButton}
                    </div>
                  </DialogDescription>
                </DialogContent>
              </Dialog>
            </div>
          </>
        )}{' '}
      {(bounty.status === 'CuratorProposed' ||
        bounty.status === 'CuratorAccepted') &&
        bounty.curator?.id !== accountAddress && (
          <div className={styles['assign-curator']}>
            <CreateProposal
              proposalVariant="bounty"
              proposalType={BountyProposalEnum.BOUNTY_UNASSIGN_CURATOR}
              bountyIndex={bounty.index.toString()}
              buttonColor="destructive"
              buttonVariant="outlined"
              buttonText="Unassign Curator"
            />
          </div>
        )}
      {bounty.status === 'CuratorAccepted' &&
        bounty.curator?.id === accountAddress && (
          <Typography variant="body2">
            You are a designated curator for this bounty
          </Typography>
        )}
    </div>
  );
}
