import type { Signer, SignerResult } from '@polkadot/api/types';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { Registry, SignerPayloadJSON } from '@polkadot/types/types';

import { objectSpread } from '@polkadot/util';

let id = 0;
export const lockCountdown: Record<string, number> = {};

export function lockAccount(pair: KeyringPair): void {
  if (Date.now() > (lockCountdown[pair.address] || 0) && !pair.isLocked) {
    pair.lock();
  }
}

export class AccountSigner implements Signer {
  private readonly keyringPair: KeyringPair;

  private readonly registry: Registry;

  constructor(registry: Registry, keyringPair: KeyringPair) {
    this.keyringPair = keyringPair;
    this.registry = registry;
  }

  public async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    return new Promise((resolve): void => {
      const signed = this.registry
        .createType('ExtrinsicPayload', payload, { version: payload.version })
        .sign(this.keyringPair);

      lockAccount(this.keyringPair);

      id += 1;
      resolve(objectSpread({ id }, signed));
    });
  }
}
