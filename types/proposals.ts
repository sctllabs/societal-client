import { Dao } from './dao';
import { Account } from './account';

export type SubscribeCouncilProposalsByDaoId = {
  readonly councilProposals: CouncilProposalMeta[];
};

export type SubscribeEthGovernanceProposalsByDaoId = {
  readonly ethGovernanceProposals: EthGovernanceProposalMeta[];
};

export type SubscribeDemocracyProposalsByDaoId = {
  readonly democracyProposals: DemocracyProposalMeta[];
};

export type SubscribeDemocracyReferendums = {
  readonly democracyReferendums: DemocracyReferendum[];
};

type VoteThreshold =
  | 'SuperMajorityApprove'
  | 'SuperMajorityAgainst'
  | 'SimpleMajority';

export type DemocracyReferendum = {
  id: string;
  status: DemocracyReferendumStatus;
  voteThreshold: VoteThreshold;
  index: number;
  democracyProposal: {
    id: string;
    index: string;
    meta: string;
    account: Account;
    kind: ProposalKind;
    blockNum: number;
    deposit: string;
    dao: Pick<Dao, 'id'>;
    __typename: 'DemocracyProposal';
  };
  __typename: 'DemocracyReferendum';
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
  | 'Closed'
  | 'Expired';

export type EthGovernanceProposalStatus = CouncilProposalStatus;

export type DemocracyProposalStatus = 'Open' | 'Referendum';

export type DemocracyReferendumStatus =
  | 'Started'
  | 'Passed'
  | 'NotPassed'
  | 'Cancelled';

type ProposalMeta = {
  id: string;
  kind: ProposalKind;
  index: number;
  account: Account;
  dao: Pick<Dao, 'id'>;
  meta: string;
  blockNum: number;
};

export type CouncilProposalMeta = ProposalMeta & {
  hash: string;
  status: CouncilProposalStatus;
  voteThreshold: number;
  __typename: 'CouncilProposal';
};

export type EthGovernanceProposalMeta = ProposalMeta & {
  hash: string;
  status: EthGovernanceProposalStatus;
  voteThreshold: bigint;
  __typename: 'EthGovernanceProposal';
};

export type DemocracyProposalMeta = ProposalMeta & {
  deposit: string;
  status: DemocracyProposalStatus;
  __typename: 'DemocracyProposal';
};

export type DemocracyReferendumMeta = ProposalMeta & {
  deposit: string;
  status: DemocracyReferendumStatus;
  __typename: 'DemocracyReferendum';
};

export type SubscribeCouncilVotesByProposalId = {
  readonly councilVoteHistories: CouncilVoteHistory[];
};

export type CouncilVoteHistory = Readonly<{
  id: string;
  approvedVote: boolean;
  votedNo: number;
  votedYes: number;
  councillor: Account;
  __typename: 'CouncilVoteHistory';
}>;

export type EthGovernanceVoteHistory = Readonly<{
  id: string;
  aye: boolean;
  balance: number;
  account: Account;
  __typename: 'EthGovernanceVoteHistory';
}>;
