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
  LOCKED_BALANCE = 'balance'
}

export enum InputLabel {
  PROPOSAL_TYPE = 'Select proposal type',
  PROPOSAL_VOTING_ACCESS = 'Select proposal voting access',
  AMOUNT = 'Amount',
  TARGET = 'Target',
  MEMBER = 'Choose a member',
  DESCRIPTION = 'Description',
  TITLE = 'Title',
  LOCKED_BALANCE = 'Locked balance'
}

export enum ProposalEnum {
  PROPOSE_TRANSFER = 'Propose Transfer',
  PROPOSE_TRANSFER_GOVERNANCE_TOKEN = 'Propose Transfer Governance Token',
  PROPOSE_ADD_MEMBER = 'Propose Add Member',
  PROPOSE_REMOVE_MEMBER = 'Propose Remove Member'
}

export enum ProposalVotingAccessEnum {
  Council = 'Council Proposals',
  Democracy = 'Governance/Democracy Proposals'
}
