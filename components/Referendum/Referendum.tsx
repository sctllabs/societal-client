import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { metamaskAccountAtom, substrateAccountAtom } from 'store/account';

import { useSubscription } from '@apollo/client';
import SUBSCRIBE_DELEGATION_BY_ID from 'query/subscribeDelegationById.graphql';

import { evmToAddress } from '@polkadot/util-crypto';

import type { SubscribeDemocracyDelegationById } from 'types';

import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { CountdownReferendum } from 'components/CountdownReferendum';

import { DelegateModal } from './DelegateModal';
import { DelegatedVotes } from './DelegatedVotes';
import { UndelegateModal } from './UndelegateModal';
import styles from './Referendum.module.scss';

export function Referendum() {
  const amount = 100;
  const currency = '$SCTL';

  const currentDao = useAtomValue(currentDaoAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);

  const accountAddress = useMemo(() => {
    if (substrateAccount) {
      return substrateAccount.address;
    }
    if (metamaskAccount && metamaskAccount?._address) {
      return evmToAddress(metamaskAccount._address);
    }
    return null;
  }, [metamaskAccount, substrateAccount]);

  const { data } = useSubscription<SubscribeDemocracyDelegationById>(
    SUBSCRIBE_DELEGATION_BY_ID,
    {
      variables: { id: `${currentDao?.id}-${accountAddress}-` }
    }
  );

  return (
    <Card className={styles.card}>
      <Typography variant="title2">
        The next referendum will start in
      </Typography>
      <CountdownReferendum end={1240000} />
      <div className={styles['item-container']}>
        <Typography variant="caption2">Locked balance</Typography>
        <span className={styles.balance}>
          <Typography variant="title1">{amount}</Typography>
          <Typography variant="title2">{currency}</Typography>
        </span>
        <Typography variant="body1">
          Here will be displayed the list of blocked tokens with which you
          seconded or voted for proposals.
        </Typography>
      </div>
      {data && data.democracyDelegations.length > 0 && (
        <div className={styles['item-container']}>
          <div className={styles['undelegate-container']}>
            <Typography variant="title2">Delegated votes</Typography>
            <UndelegateModal />
          </div>

          <DelegatedVotes delegations={data.democracyDelegations} />
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
