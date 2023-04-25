import { isEthereumAddress } from '@polkadot/util-crypto';
import { atom } from 'jotai';
import {
  ApproveOriginType,
  GovernanceEth,
  GovernanceFungibleToken
} from 'constants/governance';
import { TokenType } from 'constants/token';
import { isValidUrl } from 'utils/isValidUrl';

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
export const tokenAssetAtom = atom<File | undefined>(undefined);
export const tokenNameAtom = atom<string>('');
export const tokenTickerAtom = atom<string>('');
export const tokenQuantityAtom = atom<string>('');
export const tokenDecimalsAtom = atom<number>(0);

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

export const linksAtom = atom(['']);
export const socialsAtom = atom(['']);

export const communityInfoAtom = atom((_get) => ({
  name: _get(nameAtom),
  purpose: _get(purposeAtom),
  metadata: _get(metadataAtom),
  asset: _get(assetAtom)
}));
export const tokenAtom = atom((_get) => ({
  name: _get(tokenNameAtom),
  ticker: _get(tokenTickerAtom),
  decimals: _get(tokenDecimalsAtom),
  quantity: _get(tokenQuantityAtom),
  address: _get(ethTokenAddressAtom),
  asset: _get(tokenAssetAtom),
  type: _get(tokenTypeAtom)
}));

export const proposalPeriodsAtom = atom((_get) => ({
  proposalPeriod: _get(proposalPeriodAtom),
  votingPeriod: _get(votingPeriodAtom),
  enactmentPeriod: _get(enactmentPeriodAtom),
  voteLockingPeriod: _get(voteLockingPeriodAtom),
  launchPeriod: _get(launchPeriodAtom)
}));
export const bountyPeriodsAtom = atom((_get) => ({
  updatePeriod: _get(updatePeriodAtom),
  awardDelayPeriod: _get(awardDelayPeriodAtom),
  spendPeriod: _get(spendPeriodAtom)
}));
export const proposedDaoIdAtom = atom<number | undefined>(undefined);

export const detailsSectionDisabledAtom = atom(
  (_get) => !_get(nameAtom) || !_get(purposeAtom)
);
export const governanceSectionDisabledAtom = atom((_get) => {
  const tokenType = _get(tokenTypeAtom);
  const tokenName = _get(tokenNameAtom);
  // const tokenDecimals = _get(tokenDecimalsAtom);
  const tokenQuantity = _get(tokenQuantityAtom);
  const ethTokenAddress = _get(ethTokenAddressAtom);
  const tokenTicker = _get(tokenTickerAtom);
  const governance = _get(governanceAtom);

  switch (tokenType) {
    case TokenType.FUNGIBLE_TOKEN: {
      return (
        !tokenTicker ||
        !tokenQuantity ||
        !tokenName ||
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
export const votingTermsSectionDisabledAtom = atom((_get) => {
  const governance = _get(governanceAtom);
  const approveOrigin = _get(approveOriginAtom);
  const governancePeriods = _get(proposalPeriodsAtom);
  const bountyPeriods = _get(bountyPeriodsAtom);

  return (
    !approveOrigin ||
    !governancePeriods.proposalPeriod ||
    !bountyPeriods.spendPeriod ||
    !bountyPeriods.updatePeriod ||
    !bountyPeriods.awardDelayPeriod ||
    (governance.includes(GovernanceFungibleToken.GovernanceV1) &&
      (!governancePeriods.votingPeriod ||
        !governancePeriods.enactmentPeriod ||
        !governancePeriods.voteLockingPeriod ||
        !governancePeriods.launchPeriod))
  );
});
export const additionalInfoSectionDisabledAtom = atom((_get) => {
  const links = _get(linksAtom);
  const socials = _get(socialsAtom);

  return (
    links
      .map((link) => (link.length > 0 ? isValidUrl(link) : true))
      .filter((valid) => !valid).length > 0 ||
    socials
      .map((link) => (link.length > 0 ? isValidUrl(link) : true))
      .filter((valid) => !valid).length > 0
  );
});

export const resetCreateDaoAtom = atom(null, (_, _set) => {
  _set(nameAtom, '');
  _set(purposeAtom, '');
  _set(metadataAtom, '');
  _set(assetAtom, undefined);
  _set(membersAtom, ['']);

  _set(tokenTypeAtom, TokenType.FUNGIBLE_TOKEN);
  _set(governanceAtom, [
    GovernanceFungibleToken.GeneralCouncilAndTechnicalCommittee
  ]);
  _set(ethTokenAddressAtom, '');
  _set(tokenAssetAtom, undefined);
  _set(tokenNameAtom, '');
  _set(tokenTickerAtom, '');
  _set(tokenQuantityAtom, '');
  _set(tokenDecimalsAtom, 0);

  _set(approveOriginAtom, ApproveOriginType['50%']);

  _set(proposalPeriodAtom, undefined);
  _set(spendPeriodAtom, undefined);
  _set(votingPeriodAtom, undefined);
  _set(enactmentPeriodAtom, undefined);
  _set(voteLockingPeriodAtom, undefined);
  _set(launchPeriodAtom, undefined);
  _set(updatePeriodAtom, undefined);
  _set(awardDelayPeriodAtom, undefined);

  _set(linksAtom, ['']);
  _set(socialsAtom, ['']);
});
