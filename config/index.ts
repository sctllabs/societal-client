import assert from 'assert';

export enum Environment {
  development = 'development',
  staging = 'staging',
  production = 'production'
}

export type AppConfig = {
  appName: string;
  networkName: string;
  providerSocket: string;
  customRPCMethods?: object;
  chainId: number;
  rpcURL: string;
  daoPrecompileContractAddress: string;
  daoTreasuryContractAddress: string;
  daoCollectiveContractAddress: string;
  daoMembershipContractAddress: string;
  daoDemocracyContractAddress: string;
  daoEthGovernanceContractAddress: string;
  tokenNetwork: string;
  tokenApiKey: string;
  expectedBlockTimeInSeconds: number;
  httpApiUri: string;
  wsApiUri: string;
};

const appName = process.env.NEXT_PUBLIC_APP_NAME;
const networkName = process.env.NEXT_PUBLIC_NETWORK_NAME;
const providerSocket = process.env.NEXT_PUBLIC_PROVIDER_SOCKET;
const rpcURL = process.env.NEXT_PUBLIC_RPC_URL;
const chainIdString = process.env.NEXT_PUBLIC_CHAIN_ID;
const daoPrecompileContractAddress =
  process.env.NEXT_PUBLIC_DAO_PRECOMPILE_CONTRACT_ADDRESS;
const daoTreasuryContractAddress =
  process.env.NEXT_PUBLIC_DAO_TREASURY_CONTRACT_ADDRESS;
const daoCollectiveContractAddress =
  process.env.NEXT_PUBLIC_DAO_COLLECTIVE_CONTRACT_ADDRESS;
const daoMembershipContractAddress =
  process.env.NEXT_PUBLIC_DAO_MEMBERSHIP_CONTRACT_ADDRESS;
const daoDemocracyContractAddress =
  process.env.NEXT_PUBLIC_DAO_DEMOCRACY_CONTRACT_ADDRESS;
const daoEthGovernanceContractAddress =
  process.env.NEXT_PUBLIC_DAO_ETH_GOVERNANCE_CONTRACT_ADDRESS;
const tokenNetwork = process.env.NEXT_PUBLIC_TOKEN_NETWORK;
const tokenApiKey = process.env.NEXT_PUBLIC_TOKEN_API_KEY;
const expectedBlockTimeInSecondsString =
  process.env.NEXT_PUBLIC_EXPECTED_BLOCK_TIME_IN_SECONDS;
const httpApiUri = process.env.NEXT_PUBLIC_HTTP_API_URI;
const wsApiUri = process.env.NEXT_PUBLIC_WS_API_URI;

assert(appName, 'APP_NAME was not provided.');
assert(networkName, 'NETWORK_NAME was not provided.');
assert(providerSocket, 'PROVIDER_SOCKET was not provided.');
assert(rpcURL, 'RPC_URL was not provided.');
assert(chainIdString, 'CHAIN_ID was not provided.');
assert(
  daoPrecompileContractAddress,
  'DAO_PRECOMPILE_CONTRACT_ADDRESS was not provided.'
);
assert(
  daoTreasuryContractAddress,
  'DAO_TREASURY_CONTRACT_ADDRESS was not provided.'
);
assert(
  daoCollectiveContractAddress,
  'DAO_COLLECTIVE_CONTRACT_ADDRESS was not provided.'
);
assert(
  daoMembershipContractAddress,
  'DAO_MEMBERSHIP_CONTRACT_ADDRESS was not provided.'
);
assert(
  daoDemocracyContractAddress,
  'DAO_DEMOCRACY_CONTRACT_ADDRESS was not provided.'
);
assert(
  daoEthGovernanceContractAddress,
  'DAO_ETH_GOVERNANCE_CONTRACT_ADDRESS was not provided.'
);
assert(tokenNetwork, 'TOKEN_NETWORK was not provided.');
assert(tokenApiKey, 'TOKEN_API_KEY was not provided.');
assert(
  expectedBlockTimeInSecondsString,
  'EXPECTED_BLOCK_TIME_IN_SECONDS was not provided.'
);
assert(httpApiUri, 'HTTP_API_URI was not provided.');
assert(wsApiUri, 'WS_API_URI was not provided.');

const chainId = parseInt(chainIdString, 10);
const expectedBlockTimeInSeconds = parseInt(
  expectedBlockTimeInSecondsString,
  10
);

export const appConfig: AppConfig = {
  appName,
  networkName,
  providerSocket,
  chainId,
  rpcURL,
  daoPrecompileContractAddress,
  daoTreasuryContractAddress,
  daoCollectiveContractAddress,
  daoMembershipContractAddress,
  daoDemocracyContractAddress,
  daoEthGovernanceContractAddress,
  tokenNetwork,
  tokenApiKey,
  expectedBlockTimeInSeconds,
  httpApiUri,
  wsApiUri
};
