import abi from 'abis/dao-treasury.json';
import { appConfig } from 'config';
import { useContract } from './useContract';

export function useDaoTreasuryContract() {
  return useContract(appConfig.daoTreasuryContractAddress, abi);
}
