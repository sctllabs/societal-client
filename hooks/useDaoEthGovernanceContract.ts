import abi from 'abis/dao-eth-governance.json';
import { appConfig } from 'config';
import { useContract } from './useContract';

export function useDaoEthGovernanceContract() {
  return useContract(appConfig.daoEthGovernanceContractAddress, abi);
}
