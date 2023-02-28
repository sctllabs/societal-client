import type { IconNamesType } from 'components/ui-kit/Icon';
import type { ProposalKind } from 'types';

export enum ProposalEnum {
  TRANSFER = 'Transfer',
  TRANSFER_GOVERNANCE_TOKEN = 'Transfer Governance Token',
  ADD_MEMBER = 'Add Member',
  REMOVE_MEMBER = 'Remove Member'
}

type ProposalSettings = {
  title: string;
  icon: IconNamesType;
};

export function getProposalSettings(
  proposalKind: ProposalKind
): ProposalSettings {
  switch (proposalKind.__typename) {
    case 'AddMember': {
      return {
        title: ProposalEnum.ADD_MEMBER,
        icon: 'user-add'
      };
    }
    case 'RemoveMember': {
      return {
        title: ProposalEnum.REMOVE_MEMBER,
        icon: 'user-delete'
      };
    }
    case 'Spend': {
      return {
        title: ProposalEnum.TRANSFER,
        icon: 'transfer'
      };
    }
    case 'TransferToken': {
      return {
        title: ProposalEnum.TRANSFER_GOVERNANCE_TOKEN,
        icon: 'token'
      };
    }
    default: {
      return {
        title: ProposalEnum.TRANSFER,
        icon: 'transfer'
      };
    }
  }
}
