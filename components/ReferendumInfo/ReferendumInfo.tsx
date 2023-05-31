import { useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';

import { formatBalance } from '@polkadot/util';
import { evmToAddress } from '@polkadot/util-crypto';

import { currentBlockAtom } from 'store/api';
import {
  accountsAtom,
  currentAccountTokenBalanceAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';
import { currentDaoAtom } from 'store/dao';
import { delegationsAtom } from 'store/delegations';
import { currentReferendumAtom } from 'store/referendum';
import { tokenDecimalsAtom, tokenSymbolAtom } from 'store/token';

import { maskAddress } from 'utils/maskAddress';
import type { AssetAccount, GovernanceV1 } from 'types';

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
import { Delegation } from 'components/Delegation/Delegation';

import { DelegateModal } from './DelegateModal';

import styles from './ReferendumInfo.module.scss';

type TabOption = 'Upcoming' | 'Active';
const tabOptions: TabOption[] = ['Upcoming', 'Active'];

export function ReferendumInfo() {
  const tokenSymbol = useAtomValue(tokenSymbolAtom);
  const tokenDecimals = useAtomValue(tokenDecimalsAtom);
  const accountTokenBalance = useAtomValue(currentAccountTokenBalanceAtom);
  const currentReferendum = useAtomValue(currentReferendumAtom);
  const currentBlock = useAtomValue(currentBlockAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const accounts = useAtomValue(accountsAtom);
  const delegations = useAtomValue(delegationsAtom);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabOption>('Upcoming');

  let currentAccountId: string | undefined;

  if (substrateAccount) {
    currentAccountId = substrateAccount.address;
  }

  if (metamaskAccount?._address) {
    currentAccountId = evmToAddress(metamaskAccount._address);
  }

  const delegation = delegations?.find(
    ({ source }) => source === currentAccountId
  );

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
                  ? maskAddress(
                      (accounts?.find(
                        (_account) => _account.address === delegation.target
                      )?.meta.name as string) ?? delegation.target
                    )
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
          <Delegation />
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
