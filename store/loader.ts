import { atom } from 'jotai';
import { apiConnectedAtom } from './api';
import { currentAccountAddressAtom, currentAccountAtom } from './account';
import { daosAtom } from './dao';

export const statesLoadingAtom = atom((_get) => {
  const _apiConnected = _get(apiConnectedAtom);
  const _currentAccount = _get(currentAccountAtom);
  const _currentAccountAddress = _get(currentAccountAddressAtom);
  const _daos = _get(daosAtom);

  return (
    !_apiConnected || (!!_currentAccountAddress && !_currentAccount) || !_daos
  );
});
