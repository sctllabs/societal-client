export type State = {
  amount: string;
  target: string;
  description: string;
  title: string;
  balance: string;
};

export enum InputName {
  AMOUNT = 'amount',
  TARGET = 'target',
  DESCRIPTION = 'description',
  TITLE = 'title',
  DEPOSIT = 'balance'
}

export enum InputLabel {
  PROPOSAL_TYPE = 'Select proposal type',
  PROPOSAL_VOTING_ACCESS = 'Select proposal voting access',
  AMOUNT = 'Amount',
  TARGET = 'Target',
  MEMBER = 'Choose a member',
  DESCRIPTION = 'Description',
  TITLE = 'Title',
  DEPOSIT = 'Deposit'
}

export enum ProposalEnum {
  PROPOSE_TRANSFER = 'Propose Transfer',
  PROPOSE_TRANSFER_GOVERNANCE_TOKEN = 'Propose Transfer Governance Token',
  PROPOSE_ADD_MEMBER = 'Propose Add Member',
  PROPOSE_REMOVE_MEMBER = 'Propose Remove Member'
}

// export enum GovernanceV1 {
//   Council = 'Council',
//   Democracy = 'Governance V1'
// }

// export enum OwnershipWeightedVoting {
//   Council = 'Council',
//   EthGovernance = 'Ownership Weighted Voting'
// }

// export enum Some {
//   GovernanceV1,
//   EthGovernanceProposals
// }

// export type ProposalSelection = DemocracyProposals | EthGovernanceProposals;

export enum ProposalVotingAccessEnum {
  Council = 'Council',
  Democracy = 'Governance V1',
  EthGovernance = 'Ownership Weighted Voting'
}
