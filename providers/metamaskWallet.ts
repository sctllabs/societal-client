import { ethers } from 'ethers';
import { appConfig } from 'config';
import type { Keyring } from '@polkadot/ui-keyring';
import { evmToAddress } from '@polkadot/util-crypto';

class MetamaskWallet {
  private readonly networkName: string;
  private readonly chainId: number;
  private readonly hexChainId: string;
  private readonly rpcUrl: string;
  private readonly provider: ethers.providers.Web3Provider;

  constructor() {
    this.chainId = appConfig.chainId;
    this.networkName = appConfig.networkName;
    this.rpcUrl = appConfig.rpcURL;
    this.hexChainId = ethers.utils.hexValue(this.chainId);

    // @ts-ignore
    const { ethereum } = window;

    this.provider = new ethers.providers.Web3Provider(ethereum, {
      name: this.networkName,
      chainId: this.chainId
    });
  }

  async addNetwork() {
    try {
      await this.provider.send('wallet_addEthereumChain', [
        {
          chainId: this.hexChainId,
          chainName: this.networkName,
          rpcUrls: [this.rpcUrl],
          nativeCurrency: {
            symbol: 'SCTL',
            decimals: 18
          }
        }
      ]);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  async switchNetwork() {
    try {
      await this.provider.send('wallet_switchEthereumChain', [
        { chainId: this.hexChainId }
      ]);
    } catch (e) {
      if ((e as any).code === 4902) {
        await this.addNetwork();
      }
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  async connectWallet(keyring: Keyring, address?: string) {
    await this.switchNetwork();
    const _metamaskAccounts: string[] = await this.provider.send(
      'eth_requestAccounts',
      []
    );

    _metamaskAccounts.forEach((_metamaskAccount) => {
      keyring.addExternal(evmToAddress(_metamaskAccount), {
        isEthereum: true,
        name: _metamaskAccount,
        ethAddress: _metamaskAccount
      });
    });

    return this.provider.getSigner(address);
  }
}

export const metamaskWallet = new MetamaskWallet();
