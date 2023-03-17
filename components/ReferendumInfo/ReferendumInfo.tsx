import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { apiAtom, currentBlockAtom } from 'store/api';
import {
  accountsAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';
import { tokenSymbolAtom } from 'store/token';

import { maskAddress } from 'utils/maskAddress';
import { evmToAddress } from '@polkadot/util-crypto';
import type { Conviction, DemocracyDelegation } from 'types';
import type { Voting } from '@polkadot/types/interfaces';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { CountdownReferendum } from 'components/CountdownReferendum';

import { DelegateModal } from './DelegateModal';
import { UndelegateModal } from './UndelegateModal';

import styles from './ReferendumInfo.module.scss';

export function ReferendumInfo() {
  // const amount = 100;
  const tokenSymbol = useAtomValue(tokenSymbolAtom);

  const [delegation, setDelegation] = useState<DemocracyDelegation | null>(
    null
  );

  const currentBlock = useAtomValue(currentBlockAtom);
  const api = useAtomValue(apiAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const accounts = useAtomValue(accountsAtom);

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

  return (
    <Card className={styles.card}>
      <Typography variant="title2">
        The next referendum will start in
      </Typography>
      {currentBlock && currentDao?.policy.governance.launchPeriod && (
        <CountdownReferendum
          launchPeriod={currentDao.policy.governance.launchPeriod}
          currentBlock={currentBlock}
        />
      )}

      {/* <div className={styles['item-container']}>
        <Typography variant="caption2">Locked balance</Typography>
        <span className={styles.balance}>
          <Typography variant="title1">{amount}</Typography>
          <Typography variant="title2">{tokenSymbol}</Typography>
        </span>
        <Typography variant="body1">
          Here will be displayed the list of blocked tokens with which you
          seconded or voted for proposals.
        </Typography>
      </div> */}
      {delegation && (
        <div className={styles['item-container']}>
          <div className={styles['undelegate-container']}>
            <Typography variant="title2">Delegated votes</Typography>
            <UndelegateModal />
          </div>

          <div className={styles['delegations-container']}>
            <div className={styles.delegation} key={delegation.target}>
              <span>
                <Typography variant="caption3">Delegated account:</Typography>
                <Typography variant="title7">
                  {(accounts?.find(
                    (_account) => _account.address === delegation.target
                  )?.meta.name as string) ?? maskAddress(delegation.target)}
                </Typography>
              </span>
              <span>
                <Typography variant="caption3">Locked balance:</Typography>
                <span className={styles['locked-balance']}>
                  <Typography variant="value8">{delegation.balance}</Typography>
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
    </Card>
  );
}