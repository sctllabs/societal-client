import {
  useState,
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo
} from 'react';
import { toast } from 'react-toastify';

import { useAtomValue, useSetAtom } from 'jotai';
import {
  setCurrentMetamaskAccountAtom,
  metamaskAccountAddressAtom,
  setCurrentSubstrateAccountAtom,
  substrateAccountAtom,
  disconnectAccountsAtom
} from 'store/account';
import { keyringAtom } from 'store/api';

import { WalletMeta, WalletType } from 'types';

import { Dropdown } from 'components/ui-kit/Dropdown';
import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Notification } from 'components/ui-kit/Notifications';
import { Modal } from 'components/ui-kit/Modal';
import { Input } from 'components/ui-kit/Input';
import { MembersDropdown } from 'components/MembersDropdown';

import styles from './ConnectWallet.module.scss';

const wallets: WalletMeta[] = [
  { name: 'MetaMask', icon: 'metamask' },
  { name: 'Polkadot.js', icon: 'polkadot' },
  { name: 'Talisman', icon: 'talisman' }
];

export function ConnectWallet() {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
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
      setOpenModal(false);
    }
  }, [keyring, selectedAccountAddress, setSubstrateAccount]);

  const handleDisconnect = async () => {
    disconnectAccounts();
  };

  const handleWalletConnect = async (targetText: string) => {
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
          setOpenModal(false);
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

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setSelectedWallet(null);
    setOpenModal(false);
  };

  const accounts = keyring?.getPairs();

  const handleAccountChoose = (target: HTMLUListElement) => {
    const _selectedWalletAddress = target.getAttribute('data-address');
    if (!_selectedWalletAddress) {
      return;
    }

    setSelectedAccountAddress(_selectedWalletAddress);
  };

  const handleOnAccountClick: MouseEventHandler<HTMLUListElement> = useCallback(
    (e) => handleAccountChoose(e.target as HTMLUListElement),
    []
  );

  const handleOnAccountKeyDown: KeyboardEventHandler<HTMLUListElement> =
    useCallback((e) => {
      if (e.key !== ' ' && e.key !== 'Enter') {
        return;
      }

      handleAccountChoose(e.target as HTMLUListElement);
    }, []);

  const walletIcon = useMemo(() => {
    if (currentMetamaskAccountAddress) {
      return wallets[0].icon;
    }
    const source = currentSubstrateAccount?.meta.source;

    if (source === 'polkadot-js') {
      return wallets[1].icon;
    }
    if (source === 'talisman') {
      return wallets[2].icon;
    }
    return undefined;
  }, [currentMetamaskAccountAddress, currentSubstrateAccount?.meta.source]);

  return (
    <>
      {currentMetamaskAccountAddress || currentSubstrateAccount ? (
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

              <Button
                variant="text"
                fullWidth
                className={styles['disconnect-button']}
                onClick={handleDisconnect}
              >
                <Icon name="logout" className={styles['disconnect-icon']} />
                <Typography
                  variant="title4"
                  className={styles['disconnect-title']}
                >
                  Disconnect
                </Typography>
              </Button>
            </Card>
          }
        >
          <Button variant="outlined" className={styles.button}>
            {walletIcon && <Icon name={walletIcon} />}
            {visualAddress}
          </Button>
        </Dropdown>
      ) : (
        <Button
          variant="filled"
          className={styles.button}
          onClick={handleOpenModal}
        >
          Connect Wallet
        </Button>
      )}

      <Modal open={openModal} closeable onClose={handleCloseModal}>
        <Card className={styles['wallets-card']}>
          <Typography variant="title4">Connect wallet</Typography>
          <hr className={styles.hr} />

          {selectedWallet ? (
            <MembersDropdown
              accounts={accounts?.filter(
                (_account) => _account.meta.source === selectedWallet
              )}
              handleOnClick={handleOnAccountClick}
              handleOnKeyDown={handleOnAccountKeyDown}
            >
              <Input
                readOnly
                label="Choose an account"
                value={
                  (accounts?.find(
                    (_account) => _account.address === selectedAccountAddress
                  )?.meta.name as string) ?? selectedAccountAddress
                }
                required
              />
            </MembersDropdown>
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
                    <Icon name={_wallet.icon} />
                    <Typography variant="title4">{_wallet.name}</Typography>
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <hr className={styles.hr} />
          <Button
            variant="outlined"
            color="destructive"
            fullWidth
            onClick={handleCloseModal}
          >
            Cancel
          </Button>
        </Card>
      </Modal>
    </>
  );
}
