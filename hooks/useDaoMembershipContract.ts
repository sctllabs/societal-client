import abi from 'abis/dao-membership.json';
import { appConfig } from 'config';
import { useContract } from './useContract';

export function useDaoMembershipContract() {
  return useContract(appConfig.daoMembershipContractAddress, abi);
}
