export type WalletSource =
  | 'polkadot-js'
  | 'subwallet-js'
  | 'talisman'
  | 'metamask'
  | 'development';

export type WalletIconPath =
  | '/logo/metamask.png'
  | '/logo/polkadot.png'
  | '/logo/polkadot-test.png'
  | '/logo/subwallet.png'
  | '/logo/talisman.png';

export type WalletName =
  | 'MetaMask'
  | 'Polkadot.js'
  | 'Talisman'
  | 'Subwallet'
  | 'Development Accounts';

export type WalletMeta = {
  name: WalletName;
  icon: WalletIconPath;
  source: WalletSource;
};
