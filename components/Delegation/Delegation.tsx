import { useAtomValue } from 'jotai';

import { formatBalance } from '@polkadot/util';
import { evmToAddress } from '@polkadot/util-crypto';

import { currentDaoAtom } from 'store/dao';
import {
  accountsAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';
import { tokenSymbolAtom } from 'store/token';
import { delegationsAtom } from 'store/delegations';

import { maskAddress } from 'utils/maskAddress';

import { Typography, TypographyVariants } from 'components/ui-kit/Typography';
import { UndelegateModal } from 'components/ReferendumInfo/UndelegateModal';

import styles from './Delegation.module.scss';

type DelegationProps = {
  captionSize?: TypographyVariants | undefined;
};

export function Delegation({ captionSize }: DelegationProps) {
  const tokenSymbol = useAtomValue(tokenSymbolAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const accounts = useAtomValue(accountsAtom);
  const delegations = useAtomValue(delegationsAtom);

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
  const delegatedToYou = delegations?.filter(
    ({ target }) => target === currentAccountId
  );

  if (!delegation || !delegatedToYou) {
    return null;
  }

  return (
    <div className={styles['item-container']}>
      {delegation && (
        <div>
          <div className={styles['undelegate-container']}>
            <Typography variant={captionSize || 'title2'}>
              Delegated Votes
            </Typography>
            {delegation && <UndelegateModal />}
          </div>
          <div className={styles['delegations-container']}>
            <div className={styles.delegation} key={delegation.target}>
              <span>
                <Typography variant="caption3">To:</Typography>
                <Typography variant="title7">
                  {maskAddress(
                    (accounts?.find(
                      (_account) => _account.address === delegation.target
                    )?.meta.name as string) ?? delegation.target
                  )}
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
      {!!delegatedToYou?.length && (
        <div>
          <div className={styles['undelegate-container']}>
            <Typography variant={captionSize || 'title2'}>
              Delegated To You
            </Typography>
          </div>
          {delegatedToYou.map(({ source, target, balance, conviction }) => (
            <div className={styles['delegations-container']} key={source}>
              <div className={styles.delegation} key={target}>
                <span>
                  <Typography variant="caption3">From:</Typography>
                  <Typography variant="title7">
                    {maskAddress(
                      (accounts?.find((_account) => _account.address === source)
                        ?.meta.name as string) ?? source
                    )}
                  </Typography>
                </span>
                <span>
                  <Typography variant="caption3">Balance:</Typography>
                  <span className={styles['locked-balance']}>
                    <Typography variant="value8">
                      {formatBalance(balance, {
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
                  <Typography variant="title7">{conviction}</Typography>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
