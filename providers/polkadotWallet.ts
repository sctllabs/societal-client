import { appConfig } from 'config';
import type {
  InjectedAccount,
  InjectedWindow
} from '@polkadot/extension-inject/types';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import type { Keyring } from '@polkadot/ui-keyring';
import { WalletSource } from 'types';

class PolkadotWallet {
  private readonly appName: string;
  private readonly ss58Format?: number;

  constructor() {
    this.appName = appConfig.appName;
  }

  mapAccounts(source: string, list: InjectedAccount[]) {
    return list.map(({ address, genesisHash, name, type }) => ({
      address:
        address.length === 42
          ? address
          : encodeAddress(decodeAddress(address), this.ss58Format),
      meta: {
        genesisHash,
        name,
        source,
        isInjected: true
      },
      type
    }));
  }

  async connectWallet(keyring: Keyring, _wallet: WalletSource) {
    const injectedWindow = window as Window & InjectedWindow;
    if (!injectedWindow || !injectedWindow.injectedWeb3) {
      throw new Error(`Web3 is not detected.`);
    }
    if (!injectedWindow.injectedWeb3[_wallet]) {
      throw new Error(
        `${_wallet[0].toUpperCase()}${_wallet.substring(
          1
        )} wallet is not installed.`
      );
    }
    const provider = injectedWindow.injectedWeb3[_wallet];
    const wallet = await provider.enable(this.appName);
    const _accounts = await wallet.accounts.get();
    if (!_accounts.length) {
      throw new Error('Accounts not found');
    }
    const _mappedAccounts = this.mapAccounts(_wallet, _accounts);
    _mappedAccounts.forEach((_account) =>
      keyring.addExternal(_account.address, _account.meta)
    );
  }
}

export const polkadotWallet = new PolkadotWallet();
