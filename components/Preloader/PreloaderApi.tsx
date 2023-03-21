import { useEffect, useRef } from 'react';

import { appConfig } from 'config';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  apiAtom,
  apiConnectedAtom,
  apiErrorAtom,
  jsonrpcAtom,
  socketAtom
} from 'store/api';

export function PreloaderApi() {
  const connectRef = useRef<boolean>(false);
  const setApi = useSetAtom(apiAtom);
  const socket = useAtomValue(socketAtom);
  const setApiError = useSetAtom(apiErrorAtom);
  const setJsonRPC = useSetAtom(jsonrpcAtom);
  const setApiConnected = useSetAtom(apiConnectedAtom);

  useEffect(() => {
    if (connectRef.current) {
      return;
    }

    (async () => {
      const { default: jsonrpc } = await import(
        '@polkadot/types/interfaces/jsonrpc'
      );
      const { ApiPromise, WsProvider } = await import('@polkadot/api');

      const rpc = { ...jsonrpc, ...appConfig.customRPCMethods };
      setJsonRPC(rpc);

      const provider = new WsProvider(socket);
      const _api = new ApiPromise({ provider, rpc });

      _api.on('connected', () => setApiConnected(true));
      _api.on('disconnected', () => setApiConnected(false));
      _api.on('error', (err: Error) => setApiError(err.message));
      _api.on('ready', () => setApi(_api));
    })();

    connectRef.current = true;
  }, [setApi, setApiConnected, setApiError, setJsonRPC, socket]);

  return null;
}
