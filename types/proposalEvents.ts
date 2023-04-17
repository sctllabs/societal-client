export type SpendProposalEvent = {
  method: 'spend';
  section: 'daoTreasury';
  args: {
    dao_id: string;
    amount: string;
    beneficiary: {
      Id: string;
    };
  };
};

export type TransferTokenProposalEvent = {
  args: {
    dao_id: string;
    amount: string;
    beneficiary: {
      Id: string;
    };
  };
  method: 'transferToken';
  section: 'daoTreasury';
};

export type AddMemberProposalEvent = {
  method: 'addMember';
  section: 'daoCouncilMembers';
  args: {
    dao_id: string;
    who: string;
  };
};

export type RemoveMemberProposalEvent = {
  method: 'removeMember';
  section: 'daoCouncilMembers';
  args: {
    dao_id: string;
    who: string;
  };
};

export type CreateBountyProposalEvent = {
  args: {
    dao_id: string;
    value: string;
    description: string;
  };
  method: 'createBounty';
  section: 'daoBounties';
};

export type CreateTokenBountyProposalEvent = {
  args: {
    dao_id: string;
    token_id: string;
    value: string;
    description: string;
  };
  method: 'createTokenBounty';
  section: 'daoBounties';
};

export type ProposeCuratorProposalEvent = {
  args: {
    dao_id: string;
    bounty_id: string;
    curator: string;
    fee: string;
  };
  method: 'proposeCurator';
  section: 'daoBounties';
};

export type UnassignCuratorProposalEvent = {
  args: {
    dao_id: string;
    bounty_id: string;
  };
  method: 'unassignCurator';
  section: 'daoBounties';
};

export type ProposalEvent =
  | SpendProposalEvent
  | TransferTokenProposalEvent
  | AddMemberProposalEvent
  | RemoveMemberProposalEvent
  | CreateBountyProposalEvent
  | CreateTokenBountyProposalEvent
  | ProposeCuratorProposalEvent
  | UnassignCuratorProposalEvent;
