import { atom } from 'jotai';
import { DaoType } from 'types';

export const daosAtom = atom<DaoType[] | null>(null);
