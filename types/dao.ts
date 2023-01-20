import type { Struct, u32, Bytes } from '@polkadot/types';
import type { TreasuryProposal, Votes } from '@polkadot/types/interfaces';

type DaoPolicyProportionType = 'AtLeast' | 'MoreThan';

type DaoPolicyProportion = {
  type: DaoPolicyProportionType;
  proportion: number[];
};

type CreateDaoPolicy = {
  proposal_period: number;
  approve_origin: DaoPolicyProportion;
};

type CreateDaoTokenMetadata = {
  name: string;
  symbol: string;
  decimals: number;
};

type CreateDaoToken = {
  token_id: number;
  min_balance: string;
  metadata: CreateDaoTokenMetadata;
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
  readonly token: DaoTokenVariant;
  readonly config: DaoConfig;
}

export interface ProposalCodec extends Struct {
  readonly method: ProposalType;
  readonly section: Bytes;
  readonly args: ProposalArgs;
}

export interface VoteCodec extends Votes {}

export interface TransferCodec extends TreasuryProposal {
  daoId: string;
}

export type VoteMeta = {
  ayes: string[];
  nays: string[];
  threshold: number;
  index: number;
  end: number;
  hash: string;
};

export type DaoConfig = {
  name: string;
  purpose: string;
  metadata: string;
};

export type DaoInfo = {
  token: any; //TODO: add casting to DaoTokenVariant
  founder: string;
  accountId: string;
  config: DaoConfig;
};

export type DAO = {
  id: string;
  dao: DaoInfo;
};

export type DaoToken = {
  name: string;
  symbol: string;
  decimals: number;
  quantity: string;
};

export type DaoTokenVariant = DaoFungibleToken | DaoEthTokenAddress;

export type DaoFungibleToken = {
  tokenId: string;
};

export type DaoEthTokenAddress = {
  tokenAddress: string;
};

export type MemberMeta = {
  address: string;
  name: string;
};

export type ProposalTransfer = {
  dao_id: string;
  proposal_id: string;
};

export type ProposalMember = {
  dao_id: string;
  who: string;
};

export type ProposalGovernanceTokenTransfer = {
  dao_id: string;
  amount: string;
  beneficiary: {
    Id: string;
  };
};

export type ProposalArgs =
  | ProposalTransfer
  | ProposalMember
  | ProposalGovernanceTokenTransfer;

export type ProposalMeta = {
  hash: string;
  method: ProposalType;
  section: string;
  args: ProposalArgs;
};

export type TransferMeta = {
  hash: string;
  daoId: string;
  proposer: string;
  value: number;
  beneficiary: string;
  bond: number;
};

export type ProposalType =
  | 'addMember'
  | 'removeMember'
  | 'approveProposal'
  | 'transferToken';
