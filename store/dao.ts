import { atom } from 'jotai';
import type { Dao, DaoNameAndId } from 'types';

export const daosAtom = atom<DaoNameAndId[] | null>(null);
export const currentDaoAtom = atom<Dao | null>(null);
export const currentDaoLoadingAtom = atom<boolean>(false);

export const daoNameAtom = atom<string | undefined>(undefined);
export const daoPurposeAtom = atom<string | undefined>(undefined);
export const daoMetadataAtom = atom<string | undefined>(undefined);
export const daoAssetAtom = atom<File | undefined>(undefined);
export const daoMembersAtom = atom<string[]>(['']);

export const daoDetailsDisabledAtom = atom(
  (_get) => !_get(daoNameAtom) || !_get(daoPurposeAtom)
);
