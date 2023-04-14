import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { apiAtom, chainSymbolAtom, chainDecimalsAtom } from 'store/api';

export function PreloaderCurrency() {
  const api = useAtomValue(apiAtom);
  const setCurrencySymbol = useSetAtom(chainSymbolAtom);
  const setCurrencyDecimals = useSetAtom(chainDecimalsAtom);

  useEffect(() => {
    if (!api) {
      return;
    }

    (async () => {
      const chainProperties = await api?.registry.getChainProperties();

      if (!chainProperties) {
        return;
      }

      const { tokenSymbol, tokenDecimals } = chainProperties;

      setCurrencySymbol(tokenSymbol.value[0].toString());
      setCurrencyDecimals(parseInt(tokenDecimals.value[0].toString(), 10));
    })();
  }, [api, setCurrencySymbol, setCurrencyDecimals]);

  return null;
}
