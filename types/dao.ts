import type { Bytes, Struct } from '@polkadot/types';
import { Account } from './account';

export type SubscribeDaoById = {
  readonly daoById: Dao;
};

export type SubscribeDaos = {
  readonly daos: DaoNameAndId[];
};

export type SubscribeDemocracySecondsByProposalId = {
  readonly democracySeconds: DemocracySecond[];
};

export type DaoNameAndId = {
  id: string;
  name: string;
};

type GovernanceV1 = Readonly<{
  __typename: 'GovernanceV1';
  launchPeriod: number;
  votingPeriod: number;
  enactmentPeriod: number;
}>;

type Policy = Readonly<{
  __typename: 'Policy';
  id: string;
  proposalPeriod: number;
  governance: GovernanceV1;
}>;

type FungibleToken = Readonly<{
  __typename: 'FungibleToken';
  id: string;
  name: string;
  symbol: string;
  decimals: number;
}>;

export type Dao = Readonly<{
  __typename: 'Dao';
  id: string;
  name: string;
  purpose: string;
  metadata: string;
  council: string[];
  blockNum: number;
  account: Account;
  founder: Account;
  fungibleToken: FungibleToken;
  ethTokenAddress?: string;
  policy: Policy;
}>;

type DaoPolicyProportionType = 'AtLeast' | 'MoreThan';

type DaoPolicyProportion = {
  type: DaoPolicyProportionType;
  proportion: number[];
};

type CreateDaoPolicy = {
  proposal_period: number;
  approve_origin: DaoPolicyProportion;
  governance: DaoGovernance;
  bounty_payout_delay: number;
  bounty_update_period: number;
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

type DaoGovernance = {
  GovernanceV1: {
    enactment_period: number;
    launch_period: number;
    voting_period: number;
    vote_locking_period: number;
    fast_track_voting_period: number;
    cooloff_period: number;
    minimum_deposit: number;
  };
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
}

export type DaoToken = {
  readonly name: string;
  readonly symbol: string;
  readonly decimals: number;
  quantity: string;
};

type DemocracySecond = Readonly<{
  id: string;
  count: number;
  seconder: Account;
  __typename: 'DemocracySecond';
}>;
