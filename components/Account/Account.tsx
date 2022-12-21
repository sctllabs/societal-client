import { KeyboardEventHandler, MouseEventHandler } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';

import { keyringAtom } from 'store/api';
import {
  accountsAtom,
  currentAccountAtom,
  setCurrentAccountAtom
} from 'store/account';

import { Dropdown } from 'components/ui-kit/Dropdown';
import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';

import styles from './Account.module.scss';

export function Account() {
  const keyring = useAtomValue(keyringAtom);
  const currentAccount = useAtomValue(currentAccountAtom);
  const accounts = useAtomValue(accountsAtom);
  const setCurrentAccount = useSetAtom(setCurrentAccountAtom);

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
            {accounts?.map((x) => (
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
                    <Typography variant="title4">
                      {x.meta.name as string}
                    </Typography>
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
              ? currentAccount.meta.name?.toString()
              : 'Choose an account'}
          </Typography>
          <Icon name="arrow-down" />
        </span>
      </Button>
    </Dropdown>
  );
}
