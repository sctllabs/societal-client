import { Account } from './account';
import { Dao } from './dao';

export type BountyStatus =
  | 'Created'
  | 'BecameActive'
  | 'CuratorProposed'
  | 'CuratorUnassigned'
  | 'CuratorAccepted'
  | 'Awarded'
  | 'Claimed'
  | 'Cancelled'
  | 'Extended';

export type BountyMeta = {
  id: string;
  index: number;
  status: BountyStatus;
  nativeToken: boolean;
  description: string;
  value: string;
  unlockAt: number | null;
  updateDue: number | null;
  fee: string | null;
  payout: string | null;
  createdAt: string;
  blockNum: number;
  beneficiary: Account | null;
  curator: Account | null;
  dao: Pick<Dao, 'name' | 'id' | 'policy'>;
  __typename: 'Bounty';
};

export type SubscribeBountiesByDaoId = {
  bounties: BountyMeta[];
};

export type SubscribeBountiesByCuratorId = {
  bounties: BountyMeta[];
};
