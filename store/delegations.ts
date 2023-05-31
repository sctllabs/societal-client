import { atom } from 'jotai';
import type { DemocracyDelegation } from 'types';

export const delegationsAtom = atom<DemocracyDelegation[] | null>(null);
export const delegationsLoadingAtom = atom<boolean>(false);

export const resetDelegationsAtom = atom(null, (_get, _set) => {
  _set(delegationsAtom, null);
});
