import { isEthereumAddress } from '@polkadot/util-crypto';
import { atom } from 'jotai';
import {
  ApproveOriginType,
  GovernanceEth,
  GovernanceFungibleToken
} from 'constants/governance';
import { TokenType } from 'constants/token';

export const nameAtom = atom<string>('');
export const purposeAtom = atom<string>('');
export const metadataAtom = atom<string>('');
export const assetAtom = atom<File | undefined>(undefined);
export const membersAtom = atom<string[]>(['']);

export const tokenTypeAtom = atom<TokenType>(TokenType.FUNGIBLE_TOKEN);
export const governanceAtom = atom<(GovernanceFungibleToken | GovernanceEth)[]>(
  [GovernanceFungibleToken.GeneralCouncilAndTechnicalCommittee]
);
export const ethTokenAddressAtom = atom<string>('');
export const tokenSymbolAtom = atom<File | undefined>(undefined);
export const tokenTickerAtom = atom<string>('');
export const tokenQuantityAtom = atom<string>('');

export const approveOriginAtom = atom<ApproveOriginType>(
  ApproveOriginType['50%']
);

export const proposalPeriodAtom = atom<number | undefined>(undefined);
export const spendPeriodAtom = atom<number | undefined>(undefined);

export const votingPeriodAtom = atom<number | undefined>(undefined);
export const enactmentPeriodAtom = atom<number | undefined>(undefined);
export const voteLockingPeriodAtom = atom<number | undefined>(undefined);
export const launchPeriodAtom = atom<number | undefined>(undefined);

export const updatePeriodAtom = atom<number | undefined>(undefined);
export const awardDelayPeriodAtom = atom<number | undefined>(undefined);

export const basicPeriodsAtom = atom((_get) => ({
  proposalPeriod: _get(proposalPeriodAtom),
  spendPeriod: _get(spendPeriodAtom)
}));
export const governancePeriodsAtom = atom((_get) => ({
  votingPeriod: _get(votingPeriodAtom),
  enactmentPeriod: _get(enactmentPeriodAtom),
  voteLockingPeriod: _get(voteLockingPeriodAtom),
  launchPeriod: _get(launchPeriodAtom)
}));
export const bountyPeriodsAtom = atom((_get) => ({
  updatePeriod: _get(updatePeriodAtom),
  awardDelayPeriod: _get(awardDelayPeriodAtom)
}));

export const linksAtom = atom(['']);
export const socialsAtom = atom(['']);

export const daoDetailsSectionDisabledAtom = atom(
  (_get) => !_get(nameAtom) || !_get(purposeAtom)
);
export const daoGovernanceSectionDisabledAtom = atom((_get) => {
  const tokenType = _get(tokenTypeAtom);
  const tokenQuantity = _get(tokenQuantityAtom);
  const ethTokenAddress = _get(ethTokenAddressAtom);
  const tokenTicker = _get(tokenTickerAtom);
  const governance = _get(governanceAtom);

  switch (tokenType) {
    case TokenType.FUNGIBLE_TOKEN: {
      return (
        !tokenTicker ||
        !tokenQuantity ||
        !governance?.includes(
          GovernanceFungibleToken.GeneralCouncilAndTechnicalCommittee
        )
      );
    }
    case TokenType.ETH_TOKEN: {
      return (
        !isEthereumAddress(ethTokenAddress) ||
        !governance?.includes(GovernanceEth.GeneralCouncil)
      );
    }
    default: {
      return false;
    }
  }
});
export const daoVotingTermsSectionDisabledAtom = atom((_get) => {
  const governance = _get(governanceAtom);
  const approveOrigin = _get(approveOriginAtom);
  const basicPeriods = _get(basicPeriodsAtom);
  const governancePeriods = _get(governancePeriodsAtom);
  const bountyPeriods = _get(bountyPeriodsAtom);

  return (
    !approveOrigin ||
    !basicPeriods.proposalPeriod ||
    !basicPeriods.spendPeriod ||
    !bountyPeriods.updatePeriod ||
    !bountyPeriods.awardDelayPeriod ||
    (governance.includes(GovernanceFungibleToken.GovernanceV1) &&
      (!governancePeriods.votingPeriod ||
        !governancePeriods.enactmentPeriod ||
        !governancePeriods.voteLockingPeriod ||
        !governancePeriods.launchPeriod))
  );
});
