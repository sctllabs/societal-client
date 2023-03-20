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
  tokenBalance?: {
    balance: string;
    reservedBalance: string;
    frozenBalance: string;
    isFroze: boolean;
  };
}>;

export type AssetAccount = AssetBalance & {
  frozenBalance: TAssetBalance;
  reservedBalance: TAssetBalance;
};
