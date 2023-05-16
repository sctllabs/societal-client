import { EventRecord } from '@polkadot/types/interfaces';
import { atom } from 'jotai';

export const eventsAtom = atom<EventRecord[] | undefined>(undefined);
