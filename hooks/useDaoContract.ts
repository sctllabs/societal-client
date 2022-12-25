import daoABI from 'abis/dao.json';
import { appConfig } from 'config';
import { useContract } from './useContract';

export function useDaoContract() {
  return useContract(appConfig.daoPrecompileContractAddress, daoABI);
}
