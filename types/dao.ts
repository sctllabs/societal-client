import type { Struct, u32, u128, Bytes } from '@polkadot/types';
import type { Votes } from '@polkadot/types/interfaces';

export type DaoQuery = {
  __typename: 'Dao';
  id: string;
  name: string;
  purpose: string;
  metadata: string;
  council: string[];
  account: {
    __typename: 'Account';
    id: string;
  };
  founder: {
    __typename: 'Account';
    id: string;
  };
  fungibleToken: {
    __typename: 'FungibleToken';
    id: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  ethTokenAddress?: string;
  policy: {
    __typename: 'Policy';
    id: string;
  };
};

export type QueryDaoById = {
  daoById: DaoQuery;
};

export type SubscribeDao = {
  daos: SubscriptionDao[];
};

export type SubscriptionDao = {
  id: string;
  name: string;
};

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
  min_balance?: string;
  initial_balance: string;
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
  readonly token: DaoTokenVariantCodec;
  readonly config: DaoConfig;
}

export type ProposalArgsCodec = [u32, u128, Bytes];

export interface ProposalCodec extends Struct {
  readonly method: ProposalMethod;
  readonly section: Bytes;
  readonly args: ProposalArgsCodec;
}

export interface VoteCodec extends Votes {}

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
  token: DaoTokenVariant;
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

export type DaoTokenVariantCodec = {
  asEthTokenAddress: Bytes;
  asFungibleToken: u32;
  isEthTokenAddress: boolean;
  isFungibleToken: boolean;
};

export type DaoTokenVariant = {
  FungibleToken?: number;
  EthTokenAddress?: string;
};

export enum ProposalType {
  AddMember = 'AddMember',
  RemoveMember = 'RemoveMember',
  Spend = 'Spend',
  TransferToken = 'TransferToken'
}

export type AddMemberProposal = {
  __typename: ProposalType.AddMember;
  who: string;
};

export type RemoveMemberProposal = {
  __typename: ProposalType.RemoveMember;
  who: string;
};

export type SpendProposal = {
  __typename: ProposalType.Spend;
  beneficiary: string;
  amount: bigint;
};

export type TransferProposal = {
  __typename: ProposalType.TransferToken;
  amount: bigint;
  beneficiary: string;
};

export type SubscribeProposalsByDaoId = {
  proposals: ProposalMeta[];
};

export type ProposalKind =
  | AddMemberProposal
  | RemoveMemberProposal
  | SpendProposal
  | TransferProposal;

export type ProposalMeta = {
  id: string;
  hash: string;
  kind: ProposalKind;
  index: string;
  dao: {
    id: string;
  };
  __typename: 'Proposal';
};

export type ProposalMethod =
  | 'addMember'
  | 'removeMember'
  | 'spend'
  | 'transferToken';
