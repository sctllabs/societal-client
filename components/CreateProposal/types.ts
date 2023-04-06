export type State = {
  amount: string;
  target: string;
  balance: string;
  bountyIndex: string | undefined;
};

export type ProposalBasicState = {
  title: string;
  description: string;
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
  DEPOSIT = 'Deposit',
  FEE = 'Fee',
  CURATOR = 'Choose a bounty curator',
  BOUNTY_INDEX = 'Select bounty from the list'
}

export enum ProposalEnum {
  TRANSFER = 'Transfer',
  TRANSFER_GOVERNANCE_TOKEN = 'Transfer Governance Token',
  ADD_MEMBER = 'Add Member',
  REMOVE_MEMBER = 'Remove Member',
  BOUNTY = 'Bounty',
  BOUNTY_CURATOR = 'Bounty Curator',
  BOUNTY_UNASSIGN_CURATOR = 'Unassign Bounty Curator'
}

export enum ProposalVotingAccessEnum {
  Council = 'Council',
  Democracy = 'Governance V1',
  EthGovernance = 'Ownership Weighted Voting'
}
