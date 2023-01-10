import abi from 'abis/dao-collective.json';
import { appConfig } from 'config';
import { useContract } from './useContract';

export function useDaoCollectiveContract() {
  return useContract(appConfig.daoCollectiveContractAddress, abi);
}
