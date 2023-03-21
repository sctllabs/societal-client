import { useEffect } from 'react';

import { useAtomValue, useSetAtom } from 'jotai';
import { apiAtom, currentBlockAtom } from 'store/api';

import type { u32 } from '@polkadot/types';

export function PreloaderCurrentBlock() {
  const api = useAtomValue(apiAtom);
  const setCurrentBlock = useSetAtom(currentBlockAtom);

  useEffect(() => {
    let unsubscribe: any;

    api?.query.system
      .number((_currentBlock: u32) => setCurrentBlock(_currentBlock.toNumber()))
      .then((unsub) => {
        unsubscribe = unsub;
      });

    return () => unsubscribe && unsubscribe();
  }, [api, setCurrentBlock]);

  return null;
}
