import { MouseEventHandler, useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { AccountInfo } from '@polkadot/types/interfaces';

import { Dropdown } from 'components/ui-kit/Dropdown';
import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';

import { useKeyring, useApi } from 'hooks';

import { API_STATE, currentAccountAtom } from 'store/api';

import styles from './Account.module.scss';

type Account = {
  address: string;
  balance: string;
  name: string;
};

export function Account() {
  const [api, apiState] = useApi();
  const keyring = useKeyring();
  const [currentAccount, setCurrentAccount] = useAtom(currentAccountAtom);

  const [balances, setBalances] = useState<Account[]>([]);

  useEffect(() => {
    if (apiState !== API_STATE.READY || !keyring || !api) {
      return;
    }

    const accounts = keyring.getPairs();
    const addresses = accounts.map((account) => account.address);
    let unsubscribeAll: Function | null = null;

    api.query.system.account
      .multi(addresses, (balances: AccountInfo[]) => {
        const retrievedBalances = addresses.map(
          (address: string, index: number) => ({
            address,
            balance: balances[index].data.free.toHuman(),
            name: accounts[index].meta.name as string
          })
        );
        setBalances(retrievedBalances);
      })
      .then((unsub: Function) => {
        unsubscribeAll = unsub;
      })
      .catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [keyring]);

  const handleOnClick: MouseEventHandler = (event) => {
    if (!keyring) {
      return;
    }

    const selectedWalletAddress = (event.target as HTMLSpanElement).innerText;
    setCurrentAccount(keyring.getPair(selectedWalletAddress));
  };

  return (
    <Dropdown
      className={styles.dropdown}
      dropdownItems={
        <Card className={styles['dropdown-card']}>
          <Typography variant={'body2'} className={styles['dropdown-title']}>
            Please select address to use
          </Typography>
          <div className={styles['balances-container']} onClick={handleOnClick}>
            {balances.map((x) => (
              <Button
                key={x.address}
                variant={'text'}
                startIcon={'user-profile'}
                className={styles['dropdown-button']}
                fullWidth
              >
                {x.address}
              </Button>
            ))}
          </div>
        </Card>
      }
    >
      <Button
        startIcon={'user-profile'}
        endIcon={'arrow-down'}
        variant={'text'}
        className={styles['account-button']}
      >
        {currentAccount ? currentAccount.address : 'Choose an account'}
      </Button>
    </Dropdown>
  );
}
