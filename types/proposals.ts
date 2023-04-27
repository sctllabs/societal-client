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

export type UnassignCuratorProposal = Readonly<{
  __typename: 'UnassignCurator';
  bountyId: number;
}>;

export type ProposeCuratorProposal = Readonly<{
  __typename: 'ProposeCurator';
  bountyId: number;
  curator: string;
  fee: string;
}>;

export type CreateBountyProposal = Readonly<{
  __typename: 'CreateBounty';
  value: string;
  description: string;
}>;

export type CreateTokenBountyProposal = Readonly<{
  __typename: 'CreateTokenBounty';
  value: string;
  description: string;
  tokenId?: string;
}>;

export type AddMemberProposal = Readonly<{
  __typename: 'AddMember';
  who: string;
}>;

export type RemoveMemberProposal = Readonly<{
  __typename: 'RemoveMember';
  who: string;
}>;

export type SpendProposal = Readonly<{
  __typename: 'Spend';
  beneficiary: string;
  amount: string;
}>;

export type TransferProposal = Readonly<{
  __typename: 'TransferToken';
  amount: string;
  beneficiary: string;
}>;

export type UpdateDaoMetadataProposal = Readonly<{
  __typename: 'UpdateDaoMetadata';
  metadata: string;
}>;

export type UpdateDaoPolicyProposal = Readonly<{
  __typename: 'UpdateDaoPolicy';
  policy: string;
}>;

export type MintDaoTokenProposal = Readonly<{
  __typename: 'MintDaoToken';
  amount: string;
}>;

export type ProposalKind =
  | AddMemberProposal
  | RemoveMemberProposal
  | SpendProposal
  | TransferProposal
  | CreateBountyProposal
  | CreateTokenBountyProposal
  | ProposeCuratorProposal
  | UnassignCuratorProposal
  | UpdateDaoMetadataProposal
  | UpdateDaoPolicyProposal
  | MintDaoTokenProposal;

export type CouncilProposalStatus =
  | 'Pending'
  | 'Open'
  | 'Approved'
  | 'Disapproved'
  | 'Executed'
  | 'Closed'
  | 'Expired';

export type EthGovernanceProposalStatus = CouncilProposalStatus;

export type DemocracyProposalStatus = 'Pending' | 'Open' | 'Referendum';

export type DemocracyReferendumStatus =
  | 'Pending'
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
  executed: boolean;
  reason: string;
  __typename: 'CouncilProposal';
};

export type EthGovernanceProposalMeta = ProposalMeta & {
  hash: string;
  status: EthGovernanceProposalStatus;
  voteThreshold: string;
  executed: boolean;
  reason: string;
  blockNumber: number;
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

export type SubscribeEthVotesByProposalId = {
  readonly ethGovernanceVoteHistories: EthGovernanceVoteHistory[];
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
