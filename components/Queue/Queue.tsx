/* eslint-disable no-console */
import { useCallback, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  queueSetTransactionStatusAtom,
  queueTransactionAtom
} from 'store/queue';

import type { AddressProxy, QueueTx, QueueTxMessageSetStatus } from 'types';

import { apiAtom, currentAccountAtom, keyringAtom } from 'store/api';

export function Queue() {
  const api = useAtomValue(apiAtom);
  const keyring = useAtomValue(keyringAtom);
  const currentAccount = useAtomValue(currentAccountAtom);
  const queueTransaction = useAtomValue(queueTransactionAtom);
  const queueSetTransactionStatus = useSetAtom(queueSetTransactionStatusAtom);

  const _onSend = useCallback(
    async (
      queueSetTxStatus: QueueTxMessageSetStatus,
      currentItem: QueueTx,
      senderInfo: AddressProxy
    ): Promise<void> => {
      if (!api || !keyring || !senderInfo.signAddress) {
        return;
      }

      const { extractParams, signAndSend, wrapTx } = await import(
        'utils/queue'
      );
      const { BN_ZERO } = await import('@polkadot/util');

      const tip = BN_ZERO;
      const [tx, [status, pairOrAddress, options]] = await Promise.all([
        wrapTx(api, keyring, currentItem, senderInfo),
        extractParams(api, keyring, senderInfo.signAddress, {
          nonce: -1,
          tip
        })
      ]);

      queueSetTxStatus({ id: currentItem.id, status });

      await signAndSend(
        queueSetTxStatus,
        currentItem,
        tx,
        pairOrAddress,
        options
      );
    },
    [api, keyring]
  );

  useEffect(() => {
    if (!currentAccount) {
      return;
    }

    const errorHandler = (error: Error): void => {
      console.error(error);
    };

    const senderInfo = {
      isMultiCall: false,
      isUnlockCached: false,
      multiRoot: null,
      proxyRoot: null,
      signAddress: currentAccount.address,
      signPassword: ''
    };

    queueTransaction
      .filter((x) => x.status === 'queued')
      .forEach((queue) =>
        _onSend(queueSetTransactionStatus, queue, senderInfo).catch(
          errorHandler
        )
      );
  }, [_onSend, currentAccount, queueSetTransactionStatus, queueTransaction]);
  return null;
}
