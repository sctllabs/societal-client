export type DaoMembersState = {
  role: Role;
  addresses: string[];
};

export type DaoGovernanceState = {
  votingPeriod: string;
  votingPeriodType: ProposalPeriod;
  enactmentPeriod: string;
  enactmentPeriodType: ProposalPeriod;
  voteLockingPeriod: string;
  voteLockingPeriodType: ProposalPeriod;
  launchPeriod: string;
  launchPeriodType: ProposalPeriod;
};

export type DaoInfoState = {
  name: string;
  purpose: string;
};

export type DaoTokenState = {
  name: string;
  symbol: string;
  type: TokenType;
  quantity: string;
  decimals: number;
  address: string;
};

export enum ApproveOrigin {
  '1/2' = '50%',
  '3/5' = '60%',
  '3/4' = '75%',
  '1/1' = '100%'
}

export enum ProposalPeriod {
  DAYS = 'Days',
  HOURS = 'Hours',
  MINUTES = 'Minutes'
}

export enum TokenType {
  FUNGIBLE_TOKEN = 'Fungible Token',
  ETH_TOKEN = 'ETH Token Address'
}

export type Role = 'Council';

export type BasicPeriodName = 'proposalPeriod' | 'spendPeriod';

export type BasicPeriodTypeName = 'proposalPeriodType' | 'spendPeriodType';

export type GovernancePeriodName =
  | 'votingPeriod'
  | 'enactmentPeriod'
  | 'voteLockingPeriod'
  | 'launchPeriod';

export type GovernancePeriodTypeName =
  | 'votingPeriodType'
  | 'enactmentPeriodType'
  | 'voteLockingPeriodType'
  | 'launchPeriodType';

export type GovernancePeriodInputType = {
  title: string;
  subtitle: string;
  label: string;
  periodName: GovernancePeriodName;
  periodTypeName: GovernancePeriodTypeName;
};

export type BasicPeriodInputType = {
  title: string;
  subtitle: string;
  label: string;
  periodName: BasicPeriodName;
  periodTypeName: BasicPeriodTypeName;
};

export type DaoBasicState = {
  approveOrigin: keyof typeof ApproveOrigin;
  proposalPeriod: string;
  proposalPeriodType: ProposalPeriod;
  spendPeriod: string;
  spendPeriodType: ProposalPeriod;
};

export type DaoBountyState = {
  updatePeriod: string;
  awardDelayPeriod: string;
  updatePeriodType: ProposalPeriod;
  awardDelayPeriodType: ProposalPeriod;
};

export type BountyPeriodName = 'updatePeriod' | 'awardDelayPeriod';
export type BountyPeriodTypeName = 'updatePeriodType' | 'awardDelayPeriodType';

export type BountyPeriodInputType = {
  title: string;
  subtitle: string;
  label: string;
  periodName: BountyPeriodName;
  periodTypeName: BountyPeriodTypeName;
};
