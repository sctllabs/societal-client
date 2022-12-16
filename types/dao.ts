import type { Struct, u32, u8, Bytes, Vec } from '@polkadot/types';
import type { AccountId } from '@polkadot/types/interfaces';

export interface DaoCodec extends Struct {
  readonly accountId: Bytes;
  readonly found: Bytes;
  readonly tokenId: u32;
  readonly config: DaoConfig;
}

export interface ProposalCodec extends Struct {
  readonly method: ProposalType;
  readonly section: Bytes;
  readonly args: ProposalArgs;
}

export interface VoteCodec extends Struct {
  readonly ayes: Vec<AccountId>;
  readonly nays: Vec<AccountId>;
  readonly threshold: u8;
  readonly index: u8;
  readonly end: u8;
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
  tokenId: string;
  founder: string;
  accountId: string;
  config: DaoConfig;
};

export type DAO = {
  id: string;
  dao: DaoInfo;
  icon: string;
};

export type DaoToken = {
  name: string;
  symbol: string;
  decimals: number;
};

export type MemberMeta = {
  address: string;
  name: string;
};

export type ProposalArgs = {
  dao_id: string;
  who: string;
};

export type ProposalMeta = {
  hash: string;
  method: ProposalType;
  section: string;
  args: ProposalArgs;
};

export type ProposalType = 'addMember' | 'removeMember';
