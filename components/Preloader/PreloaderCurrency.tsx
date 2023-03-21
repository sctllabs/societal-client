import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { apiAtom, currencySymbolAtom } from 'store/api';

export function PreloaderCurrency() {
  const api = useAtomValue(apiAtom);
  const setCurrencySymbol = useSetAtom(currencySymbolAtom);

  useEffect(() => {
    if (!api) {
      return;
    }

    (async () => {
      const chainProperties = await api?.registry.getChainProperties();

      if (!chainProperties) {
        return;
      }
      setCurrencySymbol(chainProperties.tokenSymbol.value[0].toString());
    })();
  }, [api, setCurrencySymbol]);

  return null;
}
