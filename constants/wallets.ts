import { WalletMeta } from 'types';

export const wallets: WalletMeta[] = [
  { name: 'MetaMask', icon: '/logo/metamask.png', source: 'metamask' },
  { name: 'Polkadot.js', icon: '/logo/polkadot.png', source: 'polkadot-js' },
  { name: 'Talisman', icon: '/logo/talisman.png', source: 'talisman' },
  { name: 'Subwallet', icon: '/logo/subwallet.png', source: 'subwallet-js' },
  {
    name: 'Development Accounts',
    icon: '/logo/polkadot-test.png',
    source: 'development'
  }
];
