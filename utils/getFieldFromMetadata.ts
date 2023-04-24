import { hexToString } from '@polkadot/util';

export function getFieldFromMetadata(metadata: string, field: string) {
  try {
    return JSON.parse(hexToString(metadata))[field];
  } catch (e) {
    return undefined;
  }
}
