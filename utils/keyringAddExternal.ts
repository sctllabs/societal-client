import type { Keyring } from '@polkadot/ui-keyring';
import { evmToAddress } from '@polkadot/util-crypto';
import { maskAddress } from './maskAddress';

export function keyringAddExternal(keyring: Keyring, _metamaskAccount: string) {
  keyring.addExternal(evmToAddress(_metamaskAccount), {
    isEthereum: true,
    name: maskAddress(_metamaskAccount),
    ethAddress: _metamaskAccount,
    source: 'metamask'
  });
}
