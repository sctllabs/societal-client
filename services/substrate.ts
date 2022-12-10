import { appConfig } from 'config';
import { API_STATE, useStore } from 'state';

const { getState, setState } = useStore;

// Connecting to the Substrate node
export const connect = async (): Promise<void> => {
  const { apiState, socket } = getState();
  // We only want this function to be performed once
  if (apiState) {
    return;
  }

  const jsonrpcInterface = (await import('@polkadot/types/interfaces/jsonrpc'))
    .default;

  const jsonrpc = {
    ...jsonrpcInterface,
    ...appConfig.customRPCMethods
  };

  setState({
    apiState: API_STATE.CONNECT_INIT,
    jsonrpc
  });

  const { ApiPromise, WsProvider } = await import('@polkadot/api');
  const provider = new WsProvider(socket);
  const _api = new ApiPromise({ provider, rpc: jsonrpc });

  // Set listeners for disconnection and reconnection event.
  _api.on('connected', () => {
    setState({ apiState: API_STATE.CONNECTING, api: _api });
    // `ready` event is not emitted upon reconnection and is checked explicitly here.
    _api.isReady.then((_api) => setState({ apiState: API_STATE.READY }));
  });
  _api.on('ready', () => setState({ apiState: API_STATE.READY }));
  _api.on('error', (err) =>
    setState({
      apiState: API_STATE.ERROR,
      apiError: err
    })
  );
};

const retrieveChainInfo = async (api: any) => {
  const { TypeRegistry } = await import('@polkadot/types/create');
  const registry = new TypeRegistry();

  const [systemChain, systemChainType] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.chainType
      ? api.rpc.system.chainType()
      : Promise.resolve(registry.createType('ChainType', 'Live'))
  ]);

  return {
    systemChain: (systemChain || '<unknown>').toString(),
    systemChainType
  };
};

// Loading accounts from dev and polkadot-js extension
export const loadAccounts = async (): Promise<void> => {
  const { api, apiState } = getState();

  if (apiState !== API_STATE.READY) {
    return;
  }

  setState({ keyringState: API_STATE.LOADING });

  const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
  const { keyring } = await import('@polkadot/ui-keyring');

  const { isTestChain } = await import('@polkadot/util');

  try {
    await web3Enable(appConfig.appName);
    let allAccounts = await web3Accounts();

    allAccounts = allAccounts.map(({ address, meta }) => ({
      address,
      meta: { ...meta, name: `${meta.name} (${meta.source})` }
    }));

    // Logics to check if the connecting chain is a dev chain, coming from polkadot-js Apps
    // ref: https://github.com/polkadot-js/apps/blob/15b8004b2791eced0dde425d5dc7231a5f86c682/packages/react-api/src/Api.tsx?_pjax=div%5Bitemtype%3D%22http%3A%2F%2Fschema.org%2FSoftwareSourceCode%22%5D%20%3E%20main#L101-L110
    const { systemChain, systemChainType } = await retrieveChainInfo(api);
    const isDevelopment =
      systemChainType.isDevelopment ||
      systemChainType.isLocal ||
      isTestChain(systemChain);

    keyring.loadAll({ isDevelopment }, allAccounts);

    setState({ keyringState: API_STATE.READY, keyring: keyring });
  } catch (e) {
    console.error(e);
    setState({ keyringState: API_STATE.ERROR });
  }
};
