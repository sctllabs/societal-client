import { atom } from 'jotai';
import { apiConnectedAtom } from './api';
import {
  metamaskAccountAtom,
  persistMetamaskAccountAtom,
  substrateAccountAddressAtom,
  substrateAccountAtom
} from './account';

export const statesLoadingAtom = atom((_get) => {
  const _apiConnected = _get(apiConnectedAtom);
  const _substrateAccount = _get(substrateAccountAtom);
  const _substrateAccountAddress = _get(substrateAccountAddressAtom);
  const _metamaskAccountAddress = _get(persistMetamaskAccountAtom);
  const _metamaskAccount = _get(metamaskAccountAtom);

  return (
    !_apiConnected ||
    (!!_metamaskAccountAddress && !_metamaskAccount) ||
    (!!_substrateAccountAddress && !_substrateAccount)
  );
});
