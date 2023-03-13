import { useAtomValue } from 'jotai';
import { tokenSymbolAtom } from 'store/token';
import { accountsAtom } from 'store/account';

import { maskAddress } from 'utils/maskAddress';
import type { DemocracyDelegation } from 'types';

import { Typography } from 'components/ui-kit/Typography';

import styles from './Referendum.module.scss';

type DelegatedVotesProps = {
  delegations: DemocracyDelegation[];
};

export function DelegatedVotes({ delegations }: DelegatedVotesProps) {
  const tokenSymbol = useAtomValue(tokenSymbolAtom);
  const accounts = useAtomValue(accountsAtom);

  return (
    <div className={styles['delegations-container']}>
      {delegations.map((delegation) => (
        <div className={styles.delegation} key={delegation.target.id}>
          <span>
            <Typography variant="caption3">Delegated account:</Typography>
            <Typography variant="title7">
              {(accounts?.find(
                (_account) => _account.address === delegation.target.id
              )?.meta.name as string) ?? maskAddress(delegation.target.id)}
            </Typography>
          </span>
          <span>
            <Typography variant="caption3">Locked balance:</Typography>
            <span className={styles['locked-balance']}>
              <Typography variant="value8">
                {delegation.lockedBalance}
              </Typography>
              {tokenSymbol && (
                <Typography variant="title7">{tokenSymbol}</Typography>
              )}
            </span>
          </span>
          <span>
            <Typography variant="caption3">Conviction:</Typography>
            <Typography variant="title7">{delegation.conviction}</Typography>
          </span>
        </div>
      ))}
    </div>
  );
}
