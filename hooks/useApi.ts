import { useEffect } from 'react';
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

  useEffect(() => {
    const asyncConnect = async (): Promise<void> => {
      setApiState(API_STATE.CONNECT_INIT);

      const provider = new WsProvider(socket);
      const _api = new ApiPromise({ provider, rpc: jsonrpc });

      // Set listeners for disconnection and reconnection event.
      _api.on('connected', () => {
        setApiState(API_STATE.CONNECTING);
        setApi(_api);
        // `ready` event is not emitted upon reconnection and is checked explicitly here.
        _api.isReady.then((_api) => setApiState(API_STATE.READY));
      });
      _api.on('ready', () => setApiState(API_STATE.READY));
      _api.on('error', (err) => {
        setApiState(API_STATE.ERROR);
        setApiError(err);
      });
      _api.on('disconnected', () => setApiState(API_STATE.DISCONNECTED));
    };

    void asyncConnect();
  }, []);

  return [api, apiState];
};
