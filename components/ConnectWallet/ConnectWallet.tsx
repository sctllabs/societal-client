import { KeyboardEventHandler, MouseEventHandler } from 'react';
import Image from 'next/image';

import { useAtomValue, useSetAtom } from 'jotai';
import {
  setCurrentMetamaskAccountAtom,
  metamaskAccountAddressAtom,
  setCurrentSubstrateAccountAtom,
  accountsAtom,
  substrateAccountAtom,
  disconnectAccountsAtom
} from 'store/account';
import { keyringAtom } from 'store/api';

import { Dropdown } from 'components/ui-kit/Dropdown';
import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Notification } from 'components/ui-kit/Notifications';

import { toast } from 'react-toastify';
import styles from './ConnectWallet.module.scss';

const wallets = [
  { name: 'MetaMask', icon: '/logo/metamask.svg' },
  { name: 'Talisman', icon: '/logo/talisman.svg' }
];

export function ConnectWallet() {
  const currentMetamaskAccountAddress = useAtomValue(
    metamaskAccountAddressAtom
  );
  const currentSubstrateAccount = useAtomValue(substrateAccountAtom);
  const setSubstrateAccount = useSetAtom(setCurrentSubstrateAccountAtom);
  const setMetamaskAccount = useSetAtom(setCurrentMetamaskAccountAtom);
  const disconnectAccounts = useSetAtom(disconnectAccountsAtom);
  const accounts = useAtomValue(accountsAtom);
  const keyring = useAtomValue(keyringAtom);

  const handleWalletConnect = async (targetText: string) => {
    switch (targetText) {
      case 'Disconnect': {
        disconnectAccounts();
        return;
      }
      case 'MetaMask': {
        // @ts-ignore
        if (!window.ethereum || !window.ethereum.isMetaMask) {
          toast.error(
            <Notification
              title="Error"
              body="MetaMask not installed."
              variant="error"
            />
          );
          return;
        }
        const { metamask } = await import('providers/metamask');
        await metamask.connectWallet(keyring!, setMetamaskAccount);
        return;
      }
      default: {
        const account = accounts?.find(
          (_account) => _account.address === targetText
        );
        if (!account) {
          return;
        }
        setSubstrateAccount(account);
      }
    }
  };

  const handleOnClick: MouseEventHandler<HTMLUListElement> = (e) => {
    const targetWallet = (e.target as HTMLLIElement).getAttribute(
      'data-wallet'
    );

    if (!targetWallet) {
      return;
    }
    handleWalletConnect(targetWallet);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLUListElement> = (e) => {
    if (e.key !== ' ' && e.key !== 'Enter') {
      return;
    }

    const targetWallet = (e.target as HTMLLIElement).getAttribute(
      'data-wallet'
    );
    if (!targetWallet) {
      return;
    }

    handleWalletConnect(targetWallet);
  };

  const handleCopyAddress = () => {
    if (currentMetamaskAccountAddress) {
      navigator.clipboard.writeText(currentMetamaskAccountAddress);
    }

    if (currentSubstrateAccount) {
      navigator.clipboard.writeText(currentSubstrateAccount.address);
    }
  };

  let visualAddress;

  if (currentMetamaskAccountAddress) {
    visualAddress = `${currentMetamaskAccountAddress.substring(
      0,
      6
    )}...${currentMetamaskAccountAddress.substring(38)}`;
  } else if (currentSubstrateAccount) {
    visualAddress =
      currentSubstrateAccount.meta.name?.toString() ??
      currentSubstrateAccount.address;
  }

  return (
    <Dropdown
      className={styles.dropdown}
      dropdownItems={
        <Card dropdown className={styles.card}>
          <span className={styles['dropdown-title']}>
            <Typography
              variant="body2"
              className={styles['dropdown-title-text']}
            >
              {visualAddress ?? 'Please select a wallet to continue'}
            </Typography>
            {visualAddress && (
              <Button variant="icon" size="xs" onClick={handleCopyAddress}>
                <Icon name="copy" size="xs" />
              </Button>
            )}
          </span>

          <ul
            onClick={handleOnClick}
            onKeyDown={handleKeyDown}
            role="presentation"
          >
            {currentMetamaskAccountAddress || currentSubstrateAccount ? (
              <li>
                <Button
                  variant="text"
                  fullWidth
                  className={styles['wallet-button']}
                  data-wallet="Disconnect"
                >
                  <Icon name="logout" className={styles['disconnect-icon']} />
                  <Typography
                    variant="title4"
                    className={styles['disconnect-title']}
                  >
                    Disconnect
                  </Typography>
                </Button>
              </li>
            ) : (
              <>
                <li key={wallets[0].name}>
                  <Button
                    fullWidth
                    variant="text"
                    className={styles['wallet-button']}
                    data-wallet="MetaMask"
                  >
                    <span className={styles.logo}>
                      <Image src={wallets[0].icon} alt="wallet icon" fill />
                    </span>
                    <Typography variant="title4">{wallets[0].name}</Typography>
                  </Button>
                </li>
                {accounts?.map((_account) => (
                  <li key={_account.address}>
                    <Button
                      variant="text"
                      fullWidth
                      className={styles['wallet-button']}
                      data-wallet={_account.address}
                    >
                      <Icon name="user-profile" size="lg" />
                      <Typography variant="title4">
                        {_account.meta.name as string}
                      </Typography>
                    </Button>
                  </li>
                ))}
              </>
            )}
          </ul>
        </Card>
      }
    >
      <Button
        variant={
          currentMetamaskAccountAddress || currentSubstrateAccount
            ? 'outlined'
            : 'filled'
        }
        className={styles.button}
      >
        {(currentMetamaskAccountAddress || currentSubstrateAccount) && (
          <span className={styles.logo}>
            <Image
              src={
                currentMetamaskAccountAddress
                  ? wallets[0].icon
                  : wallets[1].icon
              }
              alt="wallet icon"
              fill
            />
          </span>
        )}
        {visualAddress ?? 'Connect Wallet'}
      </Button>
    </Dropdown>
  );
}
