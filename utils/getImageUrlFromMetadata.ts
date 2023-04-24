import { hexToString } from '@polkadot/util';

export function getImageUrlFromMetadata(metadata: string, field: string) {
  try {
    return JSON.parse(hexToString(metadata))[field];
  } catch (e) {
    return undefined;
  }
}
