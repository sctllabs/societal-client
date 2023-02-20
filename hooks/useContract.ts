import { useCallback, useEffect, useRef } from 'react';
import { Contract, ContractInterface, ethers } from 'ethers';

import { appConfig } from 'config';

export function useContract(
  contractAddress: string,
  contractABI: ContractInterface
) {
  const contract = useRef<Contract | null>(null);

  const connect = useCallback(async () => {
    const provider = new ethers.providers.JsonRpcProvider(appConfig.rpcURL);

    contract.current = new ethers.Contract(
      contractAddress,
      contractABI,
      provider.getSigner() || provider
    );
  }, [contractABI, contractAddress]);

  useEffect(() => {
    connect();
  }, [connect]);

  return contract.current;
}
