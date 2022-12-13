import { useCallback, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { ApiPromise, WsProvider } from '@polkadot/api';

import {
  API_STATE,
  apiAtom,
  apiErrorAtom,
  apiStateAtom,
  jsonrpcAtom,
  socketAtom
} from 'store/api';

export const useApi = (): [ApiPromise | null, API_STATE] => {
  const [api, setApi] = useAtom(apiAtom);
  const [apiState, setApiState] = useAtom(apiStateAtom);
  const socket = useAtomValue(socketAtom);
  const jsonrpc = useAtomValue(jsonrpcAtom);
  const setApiError = useSetAtom(apiErrorAtom);

  const asyncConnect = useCallback(async (): Promise<void> => {
    setApiState(API_STATE.CONNECT_INIT);

    const provider = new WsProvider(socket);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _api = new ApiPromise({ provider, rpc: jsonrpc });

    _api.on('connected', () => {
      setApiState(API_STATE.CONNECTING);
      setApi(_api);
      _api.isReady.then(() => setApiState(API_STATE.READY));
    });
    _api.on('ready', () => setApiState(API_STATE.READY));
    _api.on('error', (err) => {
      setApiState(API_STATE.ERROR);
      setApiError(err);
    });
    _api.on('disconnected', () => setApiState(API_STATE.DISCONNECTED));
  }, [jsonrpc, setApi, setApiError, setApiState, socket]);

  useEffect(() => {
    let apiLoaded: boolean = false;

    if (apiState !== API_STATE.DISCONNECTED || apiLoaded) {
      return undefined;
    }

    asyncConnect();

    return () => {
      apiLoaded = true;
    };
  }, [apiState, asyncConnect]);

  return [api, apiState];
};
