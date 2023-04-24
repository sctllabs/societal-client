import { ChangeEventHandler, useEffect, useMemo, useState } from 'react';

import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { curatorBountiesAtom, selectedCuratorBountyAtom } from 'store/bounty';
import {
  accountsAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';
import { apiAtom, chainSymbolAtom } from 'store/api';
import { tokenSymbolAtom } from 'store/token';

import { parseMeta } from 'utils/parseMeta';
import { bountySteps } from 'constants/steps';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { TxButton } from 'components/TxButton';
import { Notification } from 'components/ui-kit/Notifications';
import { Icon } from 'components/ui-kit/Icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from 'components/ui-kit/Dialog';
import { MembersDropdown } from 'components/MembersDropdown';
import { Input } from 'components/ui-kit/Input';
import { Stepper } from 'components/ui-kit/Stepper';

import styles from './CuratorBounty.module.scss';

export function CuratorBountyInfo() {
  const api = useAtomValue(apiAtom);
  const curatorBounties = useAtomValue(curatorBountiesAtom);
  const selectedCuratorBounty = useAtomValue(selectedCuratorBountyAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const chainSymbol = useAtomValue(chainSymbolAtom);
  const tokenSymbol = useAtomValue(tokenSymbolAtom);
  const accounts = useAtomValue(accountsAtom);

  const [modalOpen, setModalOpen] = useState(false);
  const [beneficiary, setBeneficiary] = useState<string | null>(null);

  const handleModalOpen = (value: boolean) => setModalOpen(value);

  const bounty = curatorBounties?.find(
    (_bounty) => _bounty.id === selectedCuratorBounty
  );

  const onSuccess = () => {
    toast.success(
      <Notification
        title="Transaction"
        body="Transaction was accepted."
        variant="success"
      />
    );

    setModalOpen(false);
  };

  useEffect(() => {
    setBeneficiary(null);
  }, [modalOpen]);

  const onFailed = () => {
    toast.error(
      <Notification
        title="Transaction declined"
        body="Transaction was declined."
        variant="error"
      />
    );
  };

  const extendButton = useMemo(() => {
    const icon = <Icon name="refresh" size="xs" />;
    const text = 'Extend Bounty';

    if (metamaskAccount) {
      return (
        <Button variant="text">
          {icon}
          {text}
        </Button>
      );
    }

    const remark = '';

    return (
      <TxButton
        variant="text"
        accountId={substrateAccount?.address}
        params={[bounty?.dao.id, bounty?.index, remark]}
        tx={api?.tx.daoBounties.extendBountyExpiry}
        onSuccess={onSuccess}
        onFailed={onFailed}
      >
        {icon}
        {text}
      </TxButton>
    );
  }, [
    api?.tx.daoBounties.extendBountyExpiry,
    bounty?.dao.id,
    bounty?.index,
    metamaskAccount,
    substrateAccount?.address
  ]);

  const awardButton = useMemo(() => {
    const text = 'Award';
    if (metamaskAccount) {
      return <Button>{text}</Button>;
    }

    return (
      <TxButton
        accountId={substrateAccount?.address}
        params={[bounty?.dao.id, bounty?.index, beneficiary]}
        tx={api?.tx.daoBounties.awardBounty}
        onSuccess={onSuccess}
        onFailed={onFailed}
      >
        {text}
      </TxButton>
    );
  }, [
    api?.tx.daoBounties.awardBounty,
    beneficiary,
    bounty?.dao.id,
    bounty?.index,
    metamaskAccount,
    substrateAccount?.address
  ]);

  const claimButton = useMemo(() => {
    const text = 'Claim';
    if (metamaskAccount) {
      return <Button>{text}</Button>;
    }

    return (
      <TxButton
        accountId={substrateAccount?.address}
        params={[bounty?.dao.id, bounty?.index]}
        tx={api?.tx.daoBounties.claimBounty}
        onSuccess={onSuccess}
        onFailed={onFailed}
      >
        {text}
      </TxButton>
    );
  }, [
    api?.tx.daoBounties.claimBounty,
    bounty?.dao.id,
    bounty?.index,
    metamaskAccount,
    substrateAccount?.address
  ]);

  if (!bounty) {
    return null;
  }

  const meta = parseMeta(bounty.description);
  const title = meta?.title;
  const description = meta?.description;

  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetValue = target.value;

    setBeneficiary(targetValue);
  };

  const onAccountValueChange = (target: string) => setBeneficiary(target);

  let activeStep: number;

  switch (bounty.status) {
    case 'Created':
    case 'BecameActive': {
      activeStep = 0;
      break;
    }
    case 'CuratorUnassigned':
    case 'CuratorProposed': {
      activeStep = 1;
      break;
    }
    case 'CuratorAccepted':
    case 'Extended': {
      activeStep = 2;
      break;
    }
    case 'Awarded': {
      activeStep = 3;
      break;
    }
    case 'Claimed': {
      activeStep = 4;
      break;
    }
    default: {
      activeStep = 0;
      break;
    }
  }

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <Typography variant="title5">Info</Typography>
        {(bounty.status === 'CuratorAccepted' ||
          bounty.status === 'Extended') &&
          extendButton}
      </div>
      <div className={styles.content}>
        <div className={styles.stepper}>
          <Stepper activeStep={activeStep} steps={bountySteps} />
        </div>
        <div className={styles.description}>
          <Typography variant="title7">{title}</Typography>
          <Typography variant="body2">{description}</Typography>
        </div>
      </div>
      <div className={styles['bottom-container']}>
        {(bounty.status === 'CuratorAccepted' ||
          bounty.status === 'Extended') && (
          <div className={styles['award-container']}>
            <Typography variant="value3">
              {bounty.value} {bounty.nativeToken ? chainSymbol : tokenSymbol}
            </Typography>

            <Dialog open={modalOpen} onOpenChange={handleModalOpen}>
              <DialogTrigger asChild>
                <Button variant="filled">Award</Button>
              </DialogTrigger>
              <DialogContent className={styles['dialog-content']}>
                <DialogTitle asChild>
                  <Typography className={styles.title} variant="title1">
                    Award bounty
                  </Typography>
                </DialogTitle>
                <DialogDescription asChild>
                  <div className={styles['dialog-description']}>
                    <MembersDropdown
                      accounts={accounts}
                      onValueChange={onAccountValueChange}
                    >
                      <Input
                        onChange={onInputChange}
                        name="beneficiary"
                        label="Beneficiary"
                        value={
                          (accounts?.find(
                            (_account) => _account.address === beneficiary
                          )?.meta.name as string) ?? beneficiary
                        }
                        required
                      />
                    </MembersDropdown>

                    {awardButton}
                  </div>
                </DialogDescription>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {bounty.status === 'Awarded' && (
          <div className={styles['award-container']}>
            <Typography variant="value3">
              {bounty.value} {bounty.nativeToken ? chainSymbol : tokenSymbol}
            </Typography>
            {claimButton}
          </div>
        )}
        {bounty.status === 'Claimed' && (
          <div className={styles.success}>
            <Typography variant="button1">Payout success</Typography>
          </div>
        )}
      </div>
    </Card>
  );
}
