import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { BN } from '@polkadot/util';

export function extractError(
  api: ApiPromise | null,
  result: Error | SubmittableResult | null
): string {
  let body = '';
  if (result instanceof Error) {
    body = result.message;
  } else {
    const { isModule, asModule: mod } = result?.dispatchError || {};
    if (isModule && mod) {
      const error = api?.registry.findMetaError(
        new Uint8Array([mod.index.toNumber(), new BN(mod.error).toNumber()])
      );

      if (error) {
        const { name, docs } = error;

        body = docs?.[0] || name;
      }
    }
  }

  return body;
}
