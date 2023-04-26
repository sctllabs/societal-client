import { useAtomValue } from 'jotai';
import { currentAccountBalanceAtom } from 'store/account';
import { chainDecimalsAtom, chainSymbolAtom } from 'store/api';

import { formatBalance } from '@polkadot/util';

import { ConnectWallet } from 'components/ConnectWallet';
import { Search } from 'components/Search';
import { Subheader } from 'components/Subheader';
import { Typography } from 'components/ui-kit/Typography';

import styles from './Header.module.scss';

export function Header() {
  const currentAccountBalance = useAtomValue(currentAccountBalanceAtom);
  const currencySymbol = useAtomValue(chainSymbolAtom);
  const currencyDecimals = useAtomValue(chainDecimalsAtom);

  return (
    <header className={styles.root}>
      <div className={styles.container}>
        <div className={styles['left-container']}>
          <Search />
        </div>
        <div className={styles['right-container']}>
          {currentAccountBalance !== null && (
            <Typography variant="caption1">
              {formatBalance(currentAccountBalance, {
                decimals: currencyDecimals || 0,
                withSi: false,
                forceUnit: '-'
              })}
              &nbsp;
              {currencySymbol}
            </Typography>
          )}
          <ConnectWallet />
        </div>
      </div>
      <Subheader />
    </header>
  );
}
