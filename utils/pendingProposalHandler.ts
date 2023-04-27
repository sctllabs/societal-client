import type { EventRecord } from '@polkadot/types/interfaces';
import type {
  AddMemberProposal,
  CouncilProposalMeta,
  CreateBountyProposal,
  CreateTokenBountyProposal,
  DemocracyProposalMeta,
  EthGovernanceProposalMeta,
  ProposalEvent,
  ProposeCuratorProposal,
  RemoveMemberProposal,
  SpendProposal,
  TransferProposal,
  UnassignCuratorProposal
} from 'types';

function getProposalKind(proposal: ProposalEvent) {
  switch (proposal.method) {
    case 'spend': {
      const spendProposal: SpendProposal = {
        __typename: 'Spend',
        amount: proposal.args.amount,
        beneficiary: proposal.args.beneficiary.Id
      };
      return spendProposal;
    }
    case 'transferToken': {
      const transferProposal: TransferProposal = {
        __typename: 'TransferToken',
        amount: proposal.args.amount,
        beneficiary: proposal.args.beneficiary.Id
      };
      return transferProposal;
    }
    case 'addMember': {
      const addMemberProposal: AddMemberProposal = {
        __typename: 'AddMember',
        who: proposal.args.who
      };
      return addMemberProposal;
    }
    case 'removeMember': {
      const removeMemberProposal: RemoveMemberProposal = {
        __typename: 'RemoveMember',
        who: proposal.args.who
      };
      return removeMemberProposal;
    }
    case 'createBounty': {
      const createBountyProposal: CreateBountyProposal = {
        __typename: 'CreateBounty',
        description: proposal.args.description,
        value: proposal.args.value
      };
      return createBountyProposal;
    }
    case 'createTokenBounty': {
      const createTokenBountyProposal: CreateTokenBountyProposal = {
        __typename: 'CreateTokenBounty',
        description: proposal.args.description,
        value: proposal.args.value
      };
      return createTokenBountyProposal;
    }
    case 'proposeCurator': {
      const proposeCuratorProposal: ProposeCuratorProposal = {
        __typename: 'ProposeCurator',
        bountyId: parseInt(proposal.args.bounty_id, 10),
        curator: proposal.args.curator,
        fee: proposal.args.fee
      };
      return proposeCuratorProposal;
    }
    case 'unassignCurator': {
      const unassignCuratorProposal: UnassignCuratorProposal = {
        __typename: 'UnassignCurator',
        bountyId: parseInt(proposal.args.bounty_id, 10)
      };
      return unassignCuratorProposal;
    }
    default: {
      throw new Error('No such proposal kind exist.');
    }
  }
}

export function pendingCouncilProposalHandler(
  eventRecord: EventRecord
): CouncilProposalMeta {
  const { event } = eventRecord;
  const data = event.data.toHuman() as any;

  const {
    proposalHash,
    proposalIndex,
    daoId,
    threshold,
    meta,
    account: accountId
  } = data;

  const id = `${daoId}-${proposalIndex}`;
  const dao = {
    id: daoId
  };
  const account = {
    id: accountId,
    __typename: 'Account' as any
  };
  const kind = getProposalKind(data.proposal);

  return {
    __typename: 'CouncilProposal',
    account,
    blockNum: Number.MAX_SAFE_INTEGER,
    dao,
    executed: false,
    hash: proposalHash,
    id,
    index: proposalIndex,
    kind,
    meta: Buffer.from(meta).toString('utf8'),
    status: 'Pending',
    voteThreshold: threshold,
    reason: ''
  };
}

export function pendingEthGovernanceProposalHandler(
  eventRecord: EventRecord
): EthGovernanceProposalMeta {
  const { event } = eventRecord;
  const data = event.data.toHuman() as any;

  const {
    proposalHash,
    proposalIndex,
    daoId,
    threshold,
    meta,
    blockNumber,
    account: accountId
  } = data;

  const id = `${daoId}-${proposalIndex}`;
  const dao = {
    id: daoId
  };
  const account = {
    id: accountId,
    __typename: 'Account' as any
  };
  const kind = getProposalKind(data.proposal);

  return {
    __typename: 'EthGovernanceProposal',
    account,
    blockNum: Number.MAX_SAFE_INTEGER,
    blockNumber,
    dao,
    executed: false,
    hash: proposalHash,
    id,
    index: proposalIndex,
    kind,
    meta: Buffer.from(meta).toString('utf8'),
    status: 'Pending',
    voteThreshold: threshold,
    reason: ''
  };
}

export function pendingDemocracyProposalHandler(
  eventRecord: EventRecord
): DemocracyProposalMeta {
  const { event } = eventRecord;
  const data = event.data.toHuman() as any;

  const { proposalIndex, daoId, meta, deposit, account: accountId } = data;

  const id = `${daoId}-${proposalIndex}`;
  const dao = {
    id: daoId
  };
  const account = {
    id: accountId,
    __typename: 'Account' as any
  };
  const kind = getProposalKind(data.proposal);

  return {
    __typename: 'DemocracyProposal',
    account,
    blockNum: Number.MAX_SAFE_INTEGER,
    dao,
    deposit,
    id,
    index: proposalIndex,
    kind,
    meta: Buffer.from(meta).toString('utf8'),
    status: 'Pending'
  };
}
