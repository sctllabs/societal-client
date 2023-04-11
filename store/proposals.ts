import { atom } from 'jotai';
import type {
  CouncilProposalMeta,
  DemocracyProposalMeta,
  EthGovernanceProposalMeta
} from 'types';

export const councilProposalsAtom = atom<CouncilProposalMeta[] | undefined>(
  undefined
);
export const ethGovernanceProposalsAtom = atom<
  EthGovernanceProposalMeta[] | undefined
>(undefined);
export const democracyProposalsAtom = atom<DemocracyProposalMeta[] | undefined>(
  undefined
);

export const councilProposalEventsAtom = atom<
  CouncilProposalMeta[] | undefined
>(undefined);
