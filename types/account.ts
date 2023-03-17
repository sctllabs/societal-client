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
