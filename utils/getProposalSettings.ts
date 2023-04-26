import type { IconNamesType } from 'components/ui-kit/Icon';
import type { ProposalKind } from 'types';

export enum ProposalEnum {
  TRANSFER = 'Transfer',
  TRANSFER_GOVERNANCE_TOKEN = 'Transfer Governance Token',
  ADD_MEMBER = 'Add Member',
  REMOVE_MEMBER = 'Remove Member',
  BOUNTY = 'Bounty',
  BOUNTY_CURATOR = 'Bounty Curator',
  UNASSIGN_CURATOR = 'Unassign Bounty Curator',
  UPDATE_DAO_METADATA = 'Update Metadata',
  UPDATE_DAO_POLICY = 'Update Policy',
  MINT_DAO_TOKEN = 'Mint Governance Token'
}

type ProposalSettings = {
  proposalTitle: string;
  icon: IconNamesType;
};

export function getProposalSettings(
  proposalKind: ProposalKind
): ProposalSettings {
  switch (proposalKind.__typename) {
    case 'AddMember': {
      return {
        proposalTitle: ProposalEnum.ADD_MEMBER,
        icon: 'user-add'
      };
    }
    case 'RemoveMember': {
      return {
        proposalTitle: ProposalEnum.REMOVE_MEMBER,
        icon: 'user-delete'
      };
    }
    case 'Spend': {
      return {
        proposalTitle: ProposalEnum.TRANSFER,
        icon: 'transfer'
      };
    }
    case 'TransferToken': {
      return {
        proposalTitle: ProposalEnum.TRANSFER_GOVERNANCE_TOKEN,
        icon: 'token'
      };
    }
    case 'CreateBounty': {
      return {
        proposalTitle: ProposalEnum.BOUNTY,
        icon: 'task'
      };
    }
    case 'CreateTokenBounty': {
      return {
        proposalTitle: ProposalEnum.BOUNTY,
        icon: 'task'
      };
    }
    case 'ProposeCurator': {
      return {
        proposalTitle: ProposalEnum.BOUNTY_CURATOR,
        icon: 'user-lock'
      };
    }
    case 'UnassignCurator': {
      return {
        proposalTitle: ProposalEnum.UNASSIGN_CURATOR,
        icon: 'user-delete'
      };
    }
    case 'UpdateDaoMetadata': {
      return {
        proposalTitle: ProposalEnum.UPDATE_DAO_METADATA,
        icon: 'database'
      };
    }
    case 'UpdateDaoPolicy': {
      return {
        proposalTitle: ProposalEnum.UPDATE_DAO_POLICY,
        icon: 'governance'
      };
    }
    case 'MintDaoToken': {
      return {
        proposalTitle: ProposalEnum.MINT_DAO_TOKEN,
        icon: 'treasury'
      };
    }
    default: {
      return {
        proposalTitle: ProposalEnum.TRANSFER,
        icon: 'transfer'
      };
    }
  }
}
