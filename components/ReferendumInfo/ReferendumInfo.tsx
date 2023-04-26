import { useEffect, useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { apiAtom, currentBlockAtom } from 'store/api';
import {
  accountsAtom,
  currentAccountTokenBalanceAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';
import { tokenDecimalsAtom, tokenSymbolAtom } from 'store/token';
import { currentReferendumAtom } from 'store/referendum';

import { maskAddress } from 'utils/maskAddress';
import { formatBalance } from '@polkadot/util';
import { evmToAddress } from '@polkadot/util-crypto';
import type {
  AssetAccount,
  Conviction,
  DemocracyDelegation,
  GovernanceV1
} from 'types';
import type { Voting } from '@polkadot/types/interfaces';

import { Tabs, TabsList, TabsTrigger } from 'components/ui-kit/Tabs';
import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { CountdownReferendum } from 'components/CountdownReferendum';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from 'components/ui-kit/Collapsible';

import { DelegateModal } from './DelegateModal';
import { UndelegateModal } from './UndelegateModal';

import styles from './ReferendumInfo.module.scss';

type TabOption = 'Upcoming' | 'Active';
const tabOptions: TabOption[] = ['Upcoming', 'Active'];

export function ReferendumInfo() {
  const tokenSymbol = useAtomValue(tokenSymbolAtom);
  const tokenDecimals = useAtomValue(tokenDecimalsAtom);
  const accountTokenBalance = useAtomValue(currentAccountTokenBalanceAtom);
  const currentReferendum = useAtomValue(currentReferendumAtom);
  const currentBlock = useAtomValue(currentBlockAtom);
  const api = useAtomValue(apiAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const accounts = useAtomValue(accountsAtom);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabOption>('Upcoming');
  const [delegation, setDelegation] = useState<DemocracyDelegation | null>(
    null
  );

  useEffect(() => {
    let unsubscribe: any;
    let accountId: string | undefined;

    if (substrateAccount) {
      accountId = substrateAccount.address;
    }

    if (metamaskAccount?._address) {
      accountId = evmToAddress(metamaskAccount._address);
    }

    if (!currentDao || !accountId) {
      return undefined;
    }

    api?.query.daoDemocracy
      .votingOf(currentDao?.id, accountId, (votingCodec: Voting) =>
        setDelegation(
          votingCodec.isDelegating
            ? {
                target: votingCodec.asDelegating.target.toString(),
                balance: votingCodec.asDelegating.balance.toString(),
                conviction:
                  votingCodec.asDelegating.conviction.toString() as Conviction
              }
            : null
        )
      )
      .then((unsub) => {
        unsubscribe = unsub;
      });

    return () => unsubscribe && unsubscribe();
  }, [
    api?.query.daoDemocracy,
    currentDao,
    currentDao?.id,
    metamaskAccount,
    substrateAccount
  ]);

  const isReferendumActive = !!currentReferendum;

  const governance = currentDao?.policy.governance as GovernanceV1;

  const onTabValueChange = (value: string) => setTab(value as TabOption);

  const lockedBalance = useMemo(
    () =>
      accountTokenBalance &&
      (accountTokenBalance as AssetAccount).reservedBalance
        ? formatBalance(
            (
              (accountTokenBalance as AssetAccount).reservedBalance.toBigInt() +
              (accountTokenBalance as AssetAccount).frozenBalance.toBigInt()
            ).toString(),
            { decimals: tokenDecimals || 0, withSi: false, forceUnit: '-' }
          )
        : 0,
    [accountTokenBalance, tokenDecimals]
  );

  return (
    <Card className={styles.card}>
      <Tabs
        value={tab}
        onValueChange={onTabValueChange}
        className={styles.tabs}
      >
        <TabsList>
          {tabOptions.map((tabOption) => (
            <TabsTrigger
              value={tabOption}
              key={tabOption}
              asChild
              disabled={tabOption === 'Active' && !isReferendumActive}
            >
              <Typography variant="title2">{tabOption}</Typography>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Typography variant="title2">
        {isReferendumActive
          ? 'Until the end of the referendum'
          : 'The next referendum will start in'}
      </Typography>
      {currentBlock && governance.launchPeriod && (
        <CountdownReferendum
          active={isReferendumActive}
          launchPeriod={
            isReferendumActive
              ? governance.votingPeriod
              : governance.launchPeriod
          }
          startingPoint={currentDao?.blockNum || 0}
          currentBlock={currentBlock}
        />
      )}

      <Collapsible
        className={styles.collapsible}
        open={open}
        onOpenChange={setOpen}
      >
        {!open && (
          <div className={styles.preview}>
            <div>
              <Typography variant="caption2">Locked balance</Typography>
              <span className={styles.balance}>
                <Typography variant="title1">{lockedBalance}</Typography>
                <Typography variant="title2">{tokenSymbol}</Typography>
              </span>
            </div>
            <div>
              <Typography variant="caption2">Delegated account</Typography>

              <Typography variant="title2">
                {delegation
                  ? (accounts?.find(
                      (_account) => _account.address === delegation.target
                    )?.meta.name as string) ?? maskAddress(delegation.target)
                  : '-'}
              </Typography>
            </div>
          </div>
        )}
        <CollapsibleTrigger asChild>
          <div className={styles['collapsible-trigger']}>
            <Typography
              className={styles['collapsible-text']}
              variant="caption3"
            >
              {open ? 'View less' : 'Detail'}
            </Typography>
            <Button variant="icon">
              <Icon name={open ? 'arrow-up' : 'arrow-down'} />
            </Button>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {accountTokenBalance ? (
            <div className={styles['item-container']}>
              <Typography variant="caption2">Locked balance</Typography>
              <span className={styles.balance}>
                <Typography variant="title1">{lockedBalance}</Typography>
                <Typography variant="title2">{tokenSymbol}</Typography>
              </span>
              <Typography variant="body1">
                Here will be displayed the list of blocked tokens with which you
                seconded or voted for proposals.
              </Typography>
            </div>
          ) : null}
          {delegation && (
            <div className={styles['item-container']}>
              <div className={styles['undelegate-container']}>
                <Typography variant="title2">Delegated votes</Typography>
                <UndelegateModal />
              </div>

              <div className={styles['delegations-container']}>
                <div className={styles.delegation} key={delegation.target}>
                  <span>
                    <Typography variant="caption3">
                      Delegated account:
                    </Typography>
                    <Typography variant="title7">
                      {(accounts?.find(
                        (_account) => _account.address === delegation.target
                      )?.meta.name as string) ?? maskAddress(delegation.target)}
                    </Typography>
                  </span>
                  <span>
                    <Typography variant="caption3">Locked balance:</Typography>
                    <span className={styles['locked-balance']}>
                      <Typography variant="value8">
                        {formatBalance(delegation.balance, {
                          decimals: currentDao?.fungibleToken.decimals,
                          withSi: false,
                          forceUnit: '-'
                        })}
                      </Typography>
                      {tokenSymbol && (
                        <Typography variant="title7">{tokenSymbol}</Typography>
                      )}
                    </span>
                  </span>
                  <span>
                    <Typography variant="caption3">Conviction:</Typography>
                    <Typography variant="title7">
                      {delegation.conviction}
                    </Typography>
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className={styles['item-container']}>
            <Typography variant="title2">Delegate Voting</Typography>
            <Typography variant="body1">
              You have the option to delegate your vote to another account whose
              opinion you trust.
            </Typography>
            <DelegateModal />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
