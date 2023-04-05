import { atom } from 'jotai';
import type { BountyMeta } from 'types';

export const bountiesAtom = atom<BountyMeta[] | null>(null);
export const curatorBountiesAtom = atom<BountyMeta[] | null>(null);
export const selectedCuratorBountyAtom = atom<string | null>(null);

export const selectedDaoBountyAtom = atom<string | null>(null);
