import abi from 'abis/dao-bounties.json';
import { appConfig } from 'config';
import { useContract } from './useContract';

export function useDaoBountiesContract() {
  return useContract(appConfig.daoBountiesContractAddress, abi);
}
