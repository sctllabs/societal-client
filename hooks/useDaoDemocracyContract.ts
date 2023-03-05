import abi from 'abis/dao-democracy.json';
import { appConfig } from 'config';
import { useContract } from './useContract';

export function useDaoDemocracyContract() {
  return useContract(appConfig.daoDemocracyContractAddress, abi);
}
