import {
  ChangeEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { toast } from 'react-toastify';
import { useAtomValue } from 'jotai';
import { formatBalance } from '@polkadot/util';

import { bountiesAtom, selectedDaoBountyAtom } from 'store/bounty';
import {
  accountsAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';
import { apiAtom, chainDecimalsAtom, chainSymbolAtom } from 'store/api';
import { tokenDecimalsAtom, tokenSymbolAtom } from 'store/token';
import { useDaoBountiesContract } from 'hooks/useDaoBountiesContract';

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
import { TxFailedCallback } from 'types';
import { extractError } from 'utils/errors';

import styles from './DaoBounty.module.scss';

export function DaoBountyInfo() {
  const api = useAtomValue(apiAtom);
  const bounties = useAtomValue(bountiesAtom);
  const selectedDaoBounty = useAtomValue(selectedDaoBountyAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const chainSymbol = useAtomValue(chainSymbolAtom);
  const tokenSymbol = useAtomValue(tokenSymbolAtom);
  const accounts = useAtomValue(accountsAtom);
  const chainDecimals = useAtomValue(chainDecimalsAtom);
  const tokenDecimals = useAtomValue(tokenDecimalsAtom);

  const [modalOpen, setModalOpen] = useState(false);
  const [beneficiary, setBeneficiary] = useState<string | null>(null);

  const daoBountiesContract = useDaoBountiesContract();

  const handleModalOpen = (value: boolean) => setModalOpen(value);

  const bounty = bounties?.find((_bounty) => _bounty.id === selectedDaoBounty);

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

  useEffect(() => {
    setBeneficiary(null);
  }, [modalOpen]);

  const onFailed: TxFailedCallback = useCallback(
    (result) => {
      toast.error(
        <Notification
          title="Transaction declined"
          body={extractError(api, result)}
          variant="error"
        />
      );
    },
    [api]
  );

  const handleAward = useCallback(async () => {
    if (!metamaskAccount) {
      return;
    }

    try {
      await daoBountiesContract
        ?.connect(metamaskAccount)
        .awardBounty(bounty?.dao.id, bounty?.index, beneficiary);
      onSuccess();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      onFailed(null);
    }
  }, [
    daoBountiesContract,
    bounty?.dao.id,
    bounty?.index,
    beneficiary,
    metamaskAccount,
    onSuccess,
    onFailed
  ]);

  const handleClaim = useCallback(async () => {
    if (!metamaskAccount) {
      return;
    }

    try {
      await daoBountiesContract
        ?.connect(metamaskAccount)
        .claimBounty(bounty?.dao.id, bounty?.index);
      onSuccess();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      onFailed(null);
    }
  }, [
    daoBountiesContract,
    bounty?.dao.id,
    bounty?.index,
    metamaskAccount,
    onSuccess,
    onFailed
  ]);

  const handleExtend = useCallback(async () => {
    if (!metamaskAccount) {
      return;
    }

    try {
      await daoBountiesContract
        ?.connect(metamaskAccount)
        .extendBounty(bounty?.dao.id, bounty?.index);
      onSuccess();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      onFailed(null);
    }
  }, [
    daoBountiesContract,
    bounty?.dao.id,
    bounty?.index,
    metamaskAccount,
    onSuccess,
    onFailed
  ]);

  const extendButton = useMemo(() => {
    const icon = <Icon name="refresh" size="xs" />;
    const text = 'Extend Bounty';

    if (metamaskAccount) {
      return (
        <Button variant="text" onClick={handleExtend}>
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
    substrateAccount?.address,
    handleExtend,
    onFailed,
    onSuccess
  ]);

  const awardButton = useMemo(() => {
    const text = 'Award';
    if (metamaskAccount) {
      return (
        <Button variant="filled" onClick={handleAward}>
          {text}
        </Button>
      );
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
    substrateAccount?.address,
    handleAward,
    onFailed,
    onSuccess
  ]);

  const claimButton = useMemo(() => {
    const text = 'Claim';
    if (metamaskAccount) {
      <Button variant="filled" onClick={handleClaim}>
        {text}
      </Button>;
    }

    return (
      <TxButton
        accountId={substrateAccount?.address}
        params={[bounty?.dao.id, bounty?.index]}
        tx={api?.tx.daoBounties.claimBounty}
        onSuccess={onSuccess}
        onFailed={(result) => onFailed(result)}
      >
        {text}
      </TxButton>
    );
  }, [
    api?.tx.daoBounties.claimBounty,
    bounty?.dao.id,
    bounty?.index,
    metamaskAccount,
    substrateAccount?.address,
    handleClaim,
    onFailed,
    onSuccess
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
              {!Number.isNaN(bounty.value)
                ? formatBalance(bounty.value?.replaceAll(',', '') || 0, {
                    decimals:
                      (bounty.nativeToken ? chainDecimals : tokenDecimals) || 0,
                    withSi: false,
                    forceUnit: '-'
                  })
                : ''}{' '}
              {bounty.nativeToken ? chainSymbol : tokenSymbol}
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
              {!Number.isNaN(bounty.value)
                ? formatBalance(bounty.value?.replaceAll(',', '') || 0, {
                    decimals:
                      (bounty.nativeToken ? chainDecimals : tokenDecimals) || 0,
                    withSi: false,
                    forceUnit: '-'
                  })
                : ''}{' '}
              {bounty.nativeToken ? chainSymbol : tokenSymbol}
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
