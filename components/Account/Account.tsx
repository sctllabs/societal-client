import {
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect,
  useState
} from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { AccountInfo } from '@polkadot/types/interfaces';

import { currentAccountAtom, apiKeyringAtom } from 'store/api';

import { Dropdown } from 'components/ui-kit/Dropdown';
import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';

import styles from './Account.module.scss';

type AccountType = {
  address: string;
  balance: string;
  name: string;
};

export function Account() {
  const [api, keyring] = useAtomValue(apiKeyringAtom);
  const [currentAccount, setCurrentAccount] = useAtom(currentAccountAtom);

  const [balances, setBalances] = useState<AccountType[]>([]);

  useEffect(() => {
    if (!keyring || !api) {
      return undefined;
    }

    const accounts = keyring.getPairs();
    const addresses = accounts.map((account) => account.address);
    let unsubscribeAll: Function | null = null;

    api.query.system.account
      .multi(addresses, (x: AccountInfo[]) => {
        const retrievedBalances = addresses.map(
          (address: string, index: number) => ({
            address,
            balance: x[index].data.free.toHuman(),
            name: accounts[index].meta.name as string
          })
        );
        setBalances(retrievedBalances);
      })
      .then((unsub: Function) => {
        unsubscribeAll = unsub;
      })
      // eslint-disable-next-line no-console
      .catch(console.error);

    return () => unsubscribeAll && unsubscribeAll();
  }, [api, keyring]);

  const handleOnClick: MouseEventHandler<HTMLUListElement> = (e) => {
    if (!keyring) {
      return;
    }

    const selectedWalletAddress = (e.target as HTMLElement).getAttribute(
      'data-address'
    );
    if (!selectedWalletAddress) {
      return;
    }
    setCurrentAccount(keyring.getPair(selectedWalletAddress));
  };

  const handleKeyDown: KeyboardEventHandler<HTMLUListElement> = (e) => {
    if (!keyring) {
      return;
    }

    if (e.key !== ' ' && e.key !== 'Enter') {
      return;
    }

    const selectedWalletAddress = (e.target as HTMLElement).getAttribute(
      'data-address'
    );
    if (!selectedWalletAddress) {
      return;
    }
    setCurrentAccount(keyring.getPair(selectedWalletAddress));
  };

  return (
    <Dropdown
      className={styles.dropdown}
      dropdownItems={
        <Card dropdown>
          <Typography variant="body2" className={styles['dropdown-title']}>
            Please select address to use
          </Typography>
          <ul
            className={styles['balances-container']}
            onClick={handleOnClick}
            onKeyDown={handleKeyDown}
            role="presentation"
          >
            {balances.map((x) => (
              <li key={x.address}>
                <Button
                  variant="text"
                  fullWidth
                  className={styles['dropdown-button']}
                  size="lg"
                  data-address={x.address}
                >
                  <span className={styles['dropdown-button-span']}>
                    <Icon name="user-profile" size="lg" />
                    <Typography variant="title4">{x.name}</Typography>
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      }
    >
      <Button variant="text" className={styles.button} size="sm">
        <span className={styles['button-span']}>
          <Icon name="user-profile" />
          <Typography variant="body1" className={styles['selected-account']}>
            {currentAccount
              ? (currentAccount.meta.name as string)
              : 'Choose an account'}
          </Typography>
          <Icon name="arrow-down" />
        </span>
      </Button>
    </Dropdown>
  );
}
