import { ChangeEventHandler, useState } from 'react';
import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import {
  accountsAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';
import { apiAtom } from 'store/api';
import { currentDaoAtom } from 'store/dao';

import { useDaoDemocracyContract } from 'hooks/useDaoDemocracyContract';

import { Notification } from 'components/ui-kit/Notifications';
import { Input } from 'components/ui-kit/Input';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { MembersDropdown } from 'components/MembersDropdown';
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
import { TxButton } from 'components/TxButton';

import styles from './Referendum.module.scss';

type DelegationState = {
  account: string;
  amount: string;
  conviction: string;
};

enum InputLabel {
  ACCOUNT = 'Delegated account',
  AMOUNT = 'Delegating amount',
  CONVICTION = 'Vote conviction'
}

enum InputName {
  ACCOUNT = 'account',
  AMOUNT = 'amount'
}

enum ConvictionOptions {
  'No Conviction' = 'None',
  '1x voting balance, locked for 1x enactment (0.00 days)' = 'Locked1x',
  '2x voting balance, locked for 2x enactment (0.00 days)' = 'Locked2x',
  '3x voting balance, locked for 4x enactment (0.00 days)' = 'Locked3x',
  '4x voting balance, locked for 8x enactment (0.00 days)' = 'Locked4x',
  '5x voting balance, locked for 16x enactment (0.01 days)' = 'Locked5x',
  '6x voting balance, locked for 32x enactment (0.01 days)' = 'Locked6x'
}

enum ConvictionToEth {
  'None' = 0,
  'Locked1x' = 1,
  'Locked2x' = 2,
  'Locked3x' = 3,
  'Locked4x' = 4,
  'Locked5x' = 5,
  'Locked6x' = 6
}

const INITIAL_STATE: DelegationState = {
  amount: '',
  account: '',
  conviction: ''
};

export function DelegateModal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [state, setState] = useState(INITIAL_STATE);

  const currentDao = useAtomValue(currentDaoAtom);
  const accounts = useAtomValue(accountsAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const api = useAtomValue(apiAtom);

  const daoDemocracyContract = useDaoDemocracyContract();

  const extrinsic = api?.tx.daoDemocracy.delegate;
  const _accounts = accounts;

  const onConvictionValueChange = (conviction: string) =>
    setState((prevState) => ({ ...prevState, conviction }));

  const onAddressValueChange = (address: string) => {
    const meta = accounts?.filter((acc) => acc.address === address)?.[0].meta;
    const account = (meta?.isEthereum ? meta.ethAddress : address) as string;

    setState((prevState) => ({
      ...prevState,
      account
    }));
  };

  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name;
    const targetValue = target.value;

    setState((prevState) => ({
      ...prevState,
      [targetName]:
        targetName === InputName.AMOUNT
          ? targetValue.replace(/[^0-9]/g, '')
          : targetValue
    }));
  };

  const onSuccess = () => {
    toast.success(
      <Notification
        title="Delegated"
        body="Vote was delegated."
        variant="success"
      />
    );
    setState(INITIAL_STATE);
    setModalOpen(false);
  };

  const handleCancelClick = () => setModalOpen(false);

  const handleDelegateClick = async () => {
    if (!metamaskAccount || !currentDao) {
      return;
    }

    try {
      await daoDemocracyContract
        ?.connect(metamaskAccount)
        .delegate(
          currentDao.id,
          state.account,
          ConvictionToEth[state.conviction as any],
          state.amount
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

  const handleTransform = () => [
    currentDao?.id,
    state.account,
    state.conviction,
    state.amount
  ];

  const disabled = !state.account || !state.conviction || !state.amount;

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button className={styles.button}>Delegate</Button>
      </DialogTrigger>
      <DialogContent className={styles['dialog-content']} closeIcon={false}>
        <DialogTitle asChild>
          <Typography className={styles.title} variant="title1">
            Delegate Voting
          </Typography>
        </DialogTitle>
        <DialogDescription asChild>
          <div className={styles['dialog-description']}>
            <MembersDropdown
              accounts={_accounts}
              onValueChange={onAddressValueChange}
            >
              <Input
                onChange={onInputChange}
                name={InputName.ACCOUNT}
                label={InputLabel.ACCOUNT}
                value={
                  (accounts?.find(
                    (_account) => _account.address === state.account
                  )?.meta.name as string) ?? state.account
                }
                required
              />
            </MembersDropdown>
            <Input
              name={InputName.AMOUNT}
              label={InputLabel.AMOUNT}
              value={state.amount}
              onChange={onInputChange}
              type="tel"
              required
            />

            <Select onValueChange={onConvictionValueChange}>
              <SelectTrigger className={styles.trigger}>
                <SelectValue placeholder={InputLabel.CONVICTION} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ConvictionOptions).map(
                  ([convictionOption, convictionValue]) => (
                    <SelectItem value={convictionValue} key={convictionOption}>
                      <Typography variant="body2">
                        {convictionOption}
                      </Typography>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <div className={styles['buttons-container']}>
              <Button
                variant="outlined"
                color="destructive"
                onClick={handleCancelClick}
              >
                Cancel
              </Button>

              {metamaskAccount ? (
                <Button onClick={handleDelegateClick} disabled={disabled}>
                  Submit delegation
                </Button>
              ) : (
                <TxButton
                  accountId={substrateAccount?.address}
                  params={handleTransform}
                  disabled={disabled}
                  tx={extrinsic}
                  onSuccess={onSuccess}
                >
                  Submit delegation
                </TxButton>
              )}
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
