import { atom } from 'jotai';
import type { Dao, DaoNameAndId } from 'types';

export const daosAtom = atom<DaoNameAndId[] | null>(null);
export const currentDaoAtom = atom<Dao | null>(null);
