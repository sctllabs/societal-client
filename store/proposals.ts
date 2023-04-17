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

export const setCouncilProposalsAtom = atom(
  null,
  (_get, _set, _councilProposals: CouncilProposalMeta[] | undefined) => {
    const councilProposals = _get(councilProposalsAtom);

    if (!_councilProposals) {
      _set(councilProposalsAtom, _councilProposals);
      return;
    }

    _set(
      councilProposalsAtom,
      councilProposals
        ? _councilProposals.concat(
            councilProposals?.filter(
              (a) => !_councilProposals.find((b) => a.id === b.id)
            )
          )
        : _councilProposals
    );
  }
);

export const setEthGovernanceProposalsAtom = atom(
  null,
  (
    _get,
    _set,
    _ethGovernanceProposals: EthGovernanceProposalMeta[] | undefined
  ) => {
    const ethGovernanceProposals = _get(ethGovernanceProposalsAtom);

    if (!_ethGovernanceProposals) {
      _set(ethGovernanceProposalsAtom, _ethGovernanceProposals);
      return;
    }

    _set(
      ethGovernanceProposalsAtom,
      ethGovernanceProposals
        ? _ethGovernanceProposals.concat(
            ethGovernanceProposals?.filter(
              (a) => !_ethGovernanceProposals.find((b) => a.id === b.id)
            )
          )
        : _ethGovernanceProposals
    );
  }
);

export const setDemocracyProposalsAtom = atom(
  null,
  (_get, _set, _democracyProposals: DemocracyProposalMeta[] | undefined) => {
    const democracyProposals = _get(democracyProposalsAtom);

    if (!_democracyProposals) {
      _set(democracyProposalsAtom, _democracyProposals);
      return;
    }

    _set(
      democracyProposalsAtom,
      democracyProposals
        ? _democracyProposals.concat(
            democracyProposals?.filter(
              (a) => !_democracyProposals.find((b) => a.id === b.id)
            )
          )
        : _democracyProposals
    );
  }
);
