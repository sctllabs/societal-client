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

export type DaoType = {
  id: string;
  dao: DaoInfo;
  icon: string;
};
