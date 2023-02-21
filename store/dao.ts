import { atom } from 'jotai';
import type { DaoQuery, SubscriptionDao } from 'types';

export const daosAtom = atom<SubscriptionDao[] | null>(null);
export const currentDaoAtom = atom<DaoQuery | null>(null);
