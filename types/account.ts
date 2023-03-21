import type { AssetBalance, TAssetBalance } from '@polkadot/types/interfaces';

export type Account = Readonly<{
  __typename: 'Account';
  id: string;
}>;

export type DaoMemberKind = 'Council' | 'TokenHolder';

export type AccountDaoMember = Readonly<{
  __typename: 'AccountDaoMember';
  accountId: string;
  kind: DaoMemberKind[];
  tokenBalance?: AssetAccount;
}>;

export type AssetAccount = AssetBalance & {
  balance: TAssetBalance;
  frozenBalance: TAssetBalance;
  reservedBalance: TAssetBalance;
  isFrozen: boolean;
};
