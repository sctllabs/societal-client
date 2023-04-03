import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import { tokenSymbolAtom } from 'store/token';

import {
  currentAccountTokenBalanceAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';
import { currentDaoAtom } from 'store/dao';

import { formatBalance } from 'utils/formatBalance';
import { useDaoDemocracyContract } from 'hooks/useDaoDemocracyContract';

import { Notification } from 'components/ui-kit/Notifications';
import { Typography } from 'components/ui-kit/Typography';
import { Card } from 'components/ui-kit/Card';
import { TxButton } from 'components/TxButton';
import { Button } from 'components/ui-kit/Button';
import { AssetAccount } from 'types';

import styles from './AccountTokenBalance.module.scss';

export function AccountTokenBalance() {
  const api = useAtomValue(apiAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const tokenSymbol = useAtomValue(tokenSymbolAtom);
  const accountTokenBalance = useAtomValue(currentAccountTokenBalanceAtom);

  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);

  const daoDemocracyContract = useDaoDemocracyContract();

  const onSuccess = () => {
    toast.success(
      <Notification
        title="Unlocked"
        body="You have unlocked tokens."
        variant="success"
      />
    );
  };

  const onFailed = () =>
    toast.error(
      <Notification
        title="Transaction failed"
        body="Transaction Failed"
        variant="error"
      />
    );

  const handleUnlock = async () => {
    if (!metamaskAccount) {
      return;
    }
    try {
      await daoDemocracyContract
        ?.connect(metamaskAccount)
        .unlock(currentDao?.id, metamaskAccount?._address);
      onSuccess();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      onFailed();
    }
  };

  const isEthToken = typeof accountTokenBalance === 'bigint' || false;

  if (!accountTokenBalance) {
    return null;
  }

  return (
    <Card className={styles.card}>
      <Typography variant="title4">Your governance token balance</Typography>
      {typeof accountTokenBalance === 'bigint' && (
        <Typography variant="caption2">
          {formatBalance(accountTokenBalance)}&nbsp;
          {tokenSymbol}
        </Typography>
      )}
      {!isEthToken && (
        <>
          <div className={styles.item}>
            <Typography variant="caption1">Free balance: </Typography>
            <Typography variant="caption2">
              {formatBalance(
                (accountTokenBalance as AssetAccount).balance.toBigInt()
              )}
              &nbsp;
              {tokenSymbol}
            </Typography>
          </div>
          <div className={styles.item}>
            <Typography variant="caption1">Reserved balance: </Typography>
            <Typography variant="caption2">
              {formatBalance(
                (accountTokenBalance as AssetAccount).reservedBalance.toBigInt()
              )}
              &nbsp;
              {tokenSymbol}
            </Typography>
          </div>
          <div className={styles.item}>
            <Typography variant="caption1">Frozen balance: </Typography>
            <Typography variant="caption2">
              {formatBalance(
                (accountTokenBalance as AssetAccount).frozenBalance.toBigInt()
              )}
              &nbsp;
              {tokenSymbol}
            </Typography>

            {metamaskAccount ? (
              <Button
                className={styles['unlock-button']}
                variant="filled"
                onClick={handleUnlock}
              >
                Revoke Vote
              </Button>
            ) : (
              (accountTokenBalance as AssetAccount)?.frozenBalance.toBigInt() >
                0 && (
                <TxButton
                  className={styles['unlock-button']}
                  accountId={substrateAccount?.address}
                  tx={api?.tx.daoDemocracy.unlock}
                  params={[currentDao?.id, substrateAccount?.address]}
                  variant="outlined"
                  onSuccess={onSuccess}
                  onFailed={onFailed}
                  size="xs"
                >
                  Unlock
                </TxButton>
              )
            )}
          </div>
        </>
      )}
    </Card>
  );
}
