import { Account } from './account';

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
  __typename: 'Bounty';
};

export type SubscribeBountiesByDaoId = {
  bounties: BountyMeta[];
};
