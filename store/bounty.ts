import { atom } from 'jotai';
import type { BountyMeta } from 'types';

export const bountiesAtom = atom<BountyMeta[] | undefined>(undefined);
