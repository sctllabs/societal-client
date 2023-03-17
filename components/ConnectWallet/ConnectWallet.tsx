import {
  useState,
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect
} from 'react';
import { toast } from 'react-toastify';
import Image from 'next/image';

import { useAtomValue, useSetAtom } from 'jotai';
import {
  setCurrentMetamaskAccountAtom,
  metamaskAccountAddressAtom,
  setCurrentSubstrateAccountAtom,
  substrateAccountAtom,
  disconnectAccountsAtom
} from 'store/account';
import { keyringAtom } from 'store/api';
import { wallets } from 'constants/wallets';

import type { WalletMeta, WalletName, WalletSource } from 'types';

import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Notification } from 'components/ui-kit/Notifications';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from 'components/ui-kit/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from 'components/ui-kit/Select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from 'components/ui-kit/DropdownMenu';

import styles from './ConnectWallet.module.scss';

export function ConnectWallet() {
  const [selectedWallet, setSelectedWallet] = useState<WalletSource | null>(
    null
  );
  const [selectedAccountAddress, setSelectedAccountAddress] =
    useState<string>('');

  const currentMetamaskAccountAddress = useAtomValue(
    metamaskAccountAddressAtom
  );
  const currentSubstrateAccount = useAtomValue(substrateAccountAtom);
  const keyring = useAtomValue(keyringAtom);
  const setSubstrateAccount = useSetAtom(setCurrentSubstrateAccountAtom);
  const setMetamaskAccount = useSetAtom(setCurrentMetamaskAccountAtom);
  const disconnectAccounts = useSetAtom(disconnectAccountsAtom);

  useEffect(() => {
    if (selectedAccountAddress) {
      const foundAccount = keyring
        ?.getPairs()
        .find((_account) => _account.address === selectedAccountAddress);

      if (!foundAccount) {
        return;
      }

      setSubstrateAccount(foundAccount);
      setSelectedAccountAddress('');
      setSelectedWallet(null);
    }
  }, [keyring, selectedAccountAddress, setSubstrateAccount]);

  const handleDisconnect = async () => {
    disconnectAccounts();
  };

  const handleWalletConnect = async (targetText: WalletName) => {
    if (!keyring) {
      return;
    }

    switch (targetText) {
      case 'MetaMask': {
        // @ts-ignore
        if (!window.ethereum || !window.ethereum.isMetaMask) {
          toast.error(
            <Notification
              title="Error"
              body="MetaMask wallet is not installed."
              variant="error"
            />
          );
          return;
        }
        const { metamaskWallet } = await import('providers/metamaskWallet');
        try {
          const signer = await metamaskWallet.connectWallet(keyring);
          await setMetamaskAccount(signer);
        } catch (e) {
          toast.error(
            <Notification
              title="Error"
              body={(e as Error).message}
              variant="error"
            />
          );
        }
        return;
      }
      case 'Polkadot.js': {
        try {
          const { polkadotWallet } = await import('providers/polkadotWallet');
          await polkadotWallet.connectWallet(keyring, 'polkadot-js');
          setSelectedWallet('polkadot-js');
        } catch (e) {
          toast.error(
            <Notification
              title="Error"
              body={(e as Error).message}
              variant="error"
            />
          );
        }
        return;
      }
      case 'Talisman': {
        try {
          const { polkadotWallet } = await import('providers/polkadotWallet');
          await polkadotWallet.connectWallet(keyring, 'talisman');
          setSelectedWallet('talisman');
        } catch (e) {
          toast.error(
            <Notification
              title="Error"
              body={(e as Error).message}
              variant="error"
            />
          );
        }
        return;
      }
      case 'Subwallet': {
        try {
          const { polkadotWallet } = await import('providers/polkadotWallet');
          await polkadotWallet.connectWallet(keyring, 'subwallet-js');
          setSelectedWallet('subwallet-js');
        } catch (e) {
          toast.error(
            <Notification
              title="Error"
              body={(e as Error).message}
              variant="error"
            />
          );
        }

        return;
      }
      case 'Development Accounts': {
        setSelectedWallet('development');
        return;
      }
      default: {
        // eslint-disable-next-line no-console
        console.error('No such wallet exists.');
      }
    }
  };

  const handleOnWalletClick: MouseEventHandler<HTMLUListElement> = (e) => {
    const targetWallet = (e.target as HTMLLIElement).getAttribute(
      'data-wallet'
    );

    if (!targetWallet) {
      return;
    }
    handleWalletConnect(targetWallet as WalletName);
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

    handleWalletConnect(targetWallet as WalletName);
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

  const accounts = keyring?.getPairs();

  const handleOnOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedWallet(null);
    }
  };

  const onAccountValueChange = (_account: string) => {
    setSelectedAccountAddress(_account);
  };

  let currentWallet: WalletMeta | undefined;
  if (currentSubstrateAccount) {
    currentWallet = wallets.find(
      (_wallet) =>
        _wallet.source ===
        (currentSubstrateAccount?.meta.source ?? 'development')
    );
  }
  if (currentMetamaskAccountAddress) {
    currentWallet = wallets.find((_wallet) => _wallet.name === 'MetaMask');
  }

  return currentMetamaskAccountAddress || currentSubstrateAccount ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outlined" className={styles.button}>
          {currentWallet && (
            <Image
              src={currentWallet.icon}
              alt={currentWallet.name}
              width={24}
              height={24}
            />
          )}
          {visualAddress}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className={styles['dropdown-content']}>
        <DropdownMenuLabel asChild>
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
        </DropdownMenuLabel>
        <DropdownMenuItem onSelect={handleDisconnect}>
          <span className={styles['disconnect-button']}>
            <Typography variant="title4">Disconnect</Typography>
            <span className={styles['disconnect-icon']}>
              <Icon name="logout" size="xs" />
            </span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Dialog onOpenChange={handleOnOpenChange}>
      <DialogTrigger asChild>
        <Button variant="filled" className={styles.button}>
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className={styles['dialog-content']} closeIcon>
        <DialogTitle asChild>
          <Typography variant="title1">Connect wallet</Typography>
        </DialogTitle>
        <div className={styles['wallets-content']}>
          {selectedWallet ? (
            <Select onValueChange={onAccountValueChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts
                  ?.filter(
                    (_account) =>
                      _account.meta.source ===
                      (selectedWallet === 'development'
                        ? undefined
                        : selectedWallet)
                  )
                  .map((_account) => (
                    <SelectItem value={_account.address} key={_account.address}>
                      <Typography variant="button2">
                        {_account.meta.name as string}
                      </Typography>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          ) : (
            <ul
              className={styles.wallets}
              onClick={handleOnWalletClick}
              onKeyDown={handleKeyDown}
              role="presentation"
            >
              {wallets.map((_wallet) => (
                <li key={_wallet.name}>
                  <Button
                    fullWidth
                    variant="outlined"
                    className={styles['wallet-button']}
                    data-wallet={_wallet.name}
                  >
                    <Image
                      src={_wallet.icon}
                      alt={_wallet.name}
                      width={24}
                      height={24}
                    />
                    <Typography variant="title4">{_wallet.name}</Typography>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
