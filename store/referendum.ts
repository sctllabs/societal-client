import { atom } from 'jotai';
import { DemocracyReferendumMeta } from 'types';

export const currentReferendumAtom = atom<DemocracyReferendumMeta | null>(null);
