import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import { tokenDecimalsAtom, tokenSymbolAtom } from 'store/token';

import {
  currentAccountTokenBalanceAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';
import { currentDaoAtom } from 'store/dao';

import { formatBalance } from '@polkadot/util';
import { useDaoDemocracyContract } from 'hooks/useDaoDemocracyContract';

import { Notification } from 'components/ui-kit/Notifications';
import { Typography } from 'components/ui-kit/Typography';
import { Card } from 'components/ui-kit/Card';
import { TxButton } from 'components/TxButton';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { AssetAccount } from 'types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from 'components/ui-kit/Tooltip';

import styles from './AccountTokenBalance.module.scss';

export function AccountTokenBalance() {
  const api = useAtomValue(apiAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const tokenSymbol = useAtomValue(tokenSymbolAtom);
  const tokenDecimals = useAtomValue(tokenDecimalsAtom);
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

  const isEthToken = typeof accountTokenBalance === 'string' || false;

  return (
    <Card className={styles.card}>
      <Typography variant="title4">Your governance token balance</Typography>
      {accountTokenBalance && typeof accountTokenBalance === 'string' && (
        <span className={styles.balance}>
          <Typography variant="caption2">
            {formatBalance(accountTokenBalance, {
              decimals: tokenDecimals || 0,
              withSi: false,
              forceUnit: '-'
            })}
          </Typography>
          <Typography variant="caption2">{tokenSymbol}</Typography>
        </span>
      )}
      {!isEthToken && (
        <div className={styles['token-container']}>
          <div className={styles.item}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={styles.icon}>
                    <Icon name="database" size="xs" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Free Balance</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className={styles.balance}>
              <Typography variant="title5">
                {accountTokenBalance
                  ? formatBalance(
                      (accountTokenBalance as AssetAccount).balance.toString(),
                      {
                        decimals: tokenDecimals || 0,
                        withSi: false,
                        forceUnit: '-'
                      }
                    )
                  : 0}
              </Typography>
              <Typography variant="caption2">{tokenSymbol}</Typography>
            </span>
          </div>
          <div className={styles.item}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={styles.icon}>
                    <Icon name="toolkit" size="xs" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Locked Balance</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className={styles.balance}>
              <Typography variant="title5">
                {accountTokenBalance
                  ? formatBalance(
                      (
                        accountTokenBalance as AssetAccount
                      ).reservedBalance.toString(),
                      {
                        decimals: tokenDecimals || 0,
                        withSi: false,
                        forceUnit: '-'
                      }
                    )
                  : 0}
              </Typography>
              <Typography variant="caption2">{tokenSymbol}</Typography>
            </span>
          </div>
          <div className={styles.item}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={styles.icon}>
                    <Icon name="spinner" size="xs" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Frozen Balance</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className={styles.balance}>
              <Typography variant="title5">
                {accountTokenBalance
                  ? formatBalance(
                      (
                        accountTokenBalance as AssetAccount
                      ).frozenBalance.toString(),
                      {
                        decimals: tokenDecimals || 0,
                        withSi: false,
                        forceUnit: '-'
                      }
                    )
                  : 0}
              </Typography>
              <Typography variant="caption2">{tokenSymbol}</Typography>
            </span>

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
        </div>
      )}
    </Card>
  );
}
