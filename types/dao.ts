import type { Struct, Bytes } from '@polkadot/types';

/* start queries */
export type SubscribeCouncilProposalsByDaoId = {
  readonly councilProposals: CouncilProposalMeta[];
};

export type SubscribeCouncilVotesByProposalId = {
  readonly councilVoteHistories: CouncilVoteHistory[];
};

export type SubscribeDaoById = {
  readonly daoById: Dao;
};

export type SubscribeDaos = {
  readonly daos: DaoNameAndId[];
};

export type SubscribeDemocracyDelegationById = {
  readonly democracyDelegations: DemocracyDelegation[];
};

export type SubscribeDemocracyProposalsByDaoId = {
  readonly democracyProposals: DemocracyProposalMeta[];
};

export type SubscribeDemocracySecondsByProposalId = {
  readonly democracySeconds: DemocracySecond[];
};

/* end queries */

export type DaoNameAndId = {
  id: string;
  name: string;
};

type Account = Readonly<{
  __typename: 'Account';
  id: string;
}>;

type Policy = Readonly<{
  __typename: 'Policy';
  id: string;
  proposalPeriod: number;
}>;

type FungibleToken = Readonly<{
  __typename: 'FungibleToken';
  id: string;
  name: string;
  symbol: string;
  decimals: number;
}>;

export type Dao = Readonly<{
  __typename: 'Dao';
  id: string;
  name: string;
  purpose: string;
  metadata: string;
  council: string[];
  blockNum: number;
  account: Account;
  founder: Account;
  fungibleToken: FungibleToken;
  ethTokenAddress?: string;
  policy: Policy;
}>;

type DaoPolicyProportionType = 'AtLeast' | 'MoreThan';

type DaoPolicyProportion = {
  type: DaoPolicyProportionType;
  proportion: number[];
};

type CreateDaoPolicy = {
  proposal_period: number;
  approve_origin: DaoPolicyProportion;
  governance: DaoGovernance;
};

type CreateDaoTokenMetadata = {
  name: string;
  symbol: string;
  decimals: number;
};

type CreateDaoToken = {
  token_id: number;
  min_balance?: string;
  initial_balance: string;
  metadata: CreateDaoTokenMetadata;
};

type DaoGovernance = {
  GovernanceV1: {
    enactment_period: number;
    launch_period: number;
    voting_period: number;
    vote_locking_period: number;
    fast_track_voting_period: number;
    cooloff_period: number;
    minimum_deposit: number;
  };
};

export type CreateDaoInput = {
  name: string;
  purpose: string;
  metadata: string;
  policy: CreateDaoPolicy;
  token?: CreateDaoToken;
  token_address?: string;
};

export interface DaoCodec extends Struct {
  readonly accountId: Bytes;
  readonly founder: Bytes;
}

export type CouncilVoteHistory = Readonly<{
  id: string;
  approvedVote: boolean;
  votedNo: number;
  votedYes: number;
  councillor: Account;
  __typename: 'VoteHistory';
}>;

export type DaoToken = {
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  quantity: string;
};

export enum ProposalType {
  AddMember = 'AddMember',
  RemoveMember = 'RemoveMember',
  Spend = 'Spend',
  TransferToken = 'TransferToken'
}

export type AddMemberProposal = Readonly<{
  __typename: ProposalType.AddMember;
  who: string;
}>;

export type RemoveMemberProposal = Readonly<{
  __typename: ProposalType.RemoveMember;
  who: string;
}>;

export type SpendProposal = Readonly<{
  __typename: ProposalType.Spend;
  beneficiary: string;
  amount: bigint;
}>;

export type TransferProposal = Readonly<{
  __typename: ProposalType.TransferToken;
  amount: bigint;
  beneficiary: string;
}>;

type Conviction =
  | 'None'
  | 'Locked1x'
  | 'Locked2x'
  | 'Locked3x'
  | 'Locked4x'
  | 'Locked5x'
  | 'Locked6x';

export type DemocracyDelegation = Readonly<{
  target: Account;
  lockedBalance: string;
  conviction: Conviction;
  __typename: 'DemocracyDelegationItem';
}>;

type DemocracySecond = Readonly<{
  id: string;
  count: number;
  seconder: Account;
  __typename: 'DemocracySecond';
}>;

export type ProposalKind =
  | AddMemberProposal
  | RemoveMemberProposal
  | SpendProposal
  | TransferProposal;

export type CouncilProposalStatus =
  | 'Open'
  | 'Approved'
  | 'Disapproved'
  | 'Executed'
  | 'Closed';

export type DemocracyProposalStatus =
  | 'Open'
  | 'Started'
  | 'Passed'
  | 'NotPassed'
  | 'Cancelled';

export type CouncilProposalMeta = Readonly<{
  id: string;
  hash: string;
  kind: ProposalKind;
  index: string;
  status: CouncilProposalStatus;
  blockNum: number;
  voteThreshold: number;
  meta: string;
  dao: Pick<Dao, 'id'>;
  account: Account;
  __typename: 'CouncilProposal';
}>;

export type DemocracyProposalMeta = Readonly<{
  id: string;
  kind: ProposalKind;
  index: string;
  deposit: string;
  status: DemocracyProposalStatus;
  blockNum: number;
  meta: string;
  dao: Pick<Dao, 'id'>;
  account: Account;
  __typename: 'DemocracyProposal';
}>;
