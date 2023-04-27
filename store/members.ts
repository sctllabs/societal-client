import { atom } from 'jotai';
import type { AccountDaoMember } from 'types';

export const membersAtom = atom<AccountDaoMember[] | null>(null);
export const membersLoadingAtom = atom<boolean>(false);

export const resetMembersAtom = atom(null, (_get, _set) => {
  _set(membersAtom, null);
});
