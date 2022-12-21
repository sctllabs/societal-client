import { atom } from 'jotai';
import type { DAO } from 'types';

export const daosAtom = atom<DAO[] | null>(null);
export const createdDaoIdAtom = atom<number | null>(null);
