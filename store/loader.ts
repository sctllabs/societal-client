import { atom } from 'jotai';
import { apiConnectedAtom } from './api';
import {
  metamaskAccountAtom,
  persistMetamaskAccountAtom,
  substrateAccountAddressAtom,
  substrateAccountAtom
} from './account';
import { daosAtom } from './dao';

export const statesLoadingAtom = atom((_get) => {
  const _apiConnected = _get(apiConnectedAtom);
  const _substrateAccount = _get(substrateAccountAtom);
  const _substrateAccountAddress = _get(substrateAccountAddressAtom);
  const _metamaskAccountAddress = _get(persistMetamaskAccountAtom);
  const _metamaskAccount = _get(metamaskAccountAtom);
  const _daos = _get(daosAtom);

  return (
    !_apiConnected ||
    (!!_metamaskAccountAddress && !_metamaskAccount) ||
    (!!_substrateAccountAddress && !_substrateAccount) ||
    !_daos
  );
});
