import { ApiPromise, SubmittableResult } from '@polkadot/api';
import { BN } from '@polkadot/util';

export function extractErrorFromString(
  api: ApiPromise | null,
  value: string | null
): string {
  if (!value) {
    return '';
  }

  try {
    let json = JSON.parse(value);
    if (
      json?.error?.type === 'Buffer' &&
      json?.error?.data &&
      Array.isArray(json?.error?.data)
    ) {
      const error = api?.registry.findMetaError(
        new Uint8Array([
          json.index,
          new BN(new (Buffer as any).from(json?.error?.data)).toNumber()
        ])
      );

      if (error) {
        const { name, docs } = error;

        return docs?.[0] || name;
      }
    }

    return value;
  } catch (e) {
    return value;
  }
}

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
