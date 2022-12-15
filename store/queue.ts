import { atom } from 'jotai';
import {
  QueueStatus,
  QueueTx,
  QueueTxExtrinsic,
  QueueTxRpc,
  QueueActionSetTransaction,
  QueueTxStatus
} from 'types';
import { jsonrpcAtom } from 'store/api';
import type { SubmittableResult } from '@polkadot/api';

export const queueIdAtom = atom<number>(0);
export const queueStatusAtom = atom<QueueStatus[]>([]);
export const queueTransactionAtom = atom<QueueTx[]>([]);
const REMOVE_TIMEOUT = 7500;

export const STATUS_COMPLETE: QueueTxStatus[] = [
  // status from subscription
  'finalitytimeout',
  'finalized',
  'inblock',
  'usurped',
  'dropped',
  'invalid',
  // normal completion
  'cancelled',
  'error',
  'sent'
];

export const queueExtrinsicAtom = atom(
  null,
  (_get, _set, value: QueueTxExtrinsic | QueueTxRpc | QueueTx) => {
    const id = _get(queueIdAtom);
    const txRef = _get(queueTransactionAtom);
    const jsonrpc = _get(jsonrpcAtom);

    const removeItem = () =>
      _set(queueTransactionAtom, [
        ...txRef.map(
          (item): QueueTx =>
            item.id === id ? { ...item, status: 'completed' } : item
        )
      ]);

    _set(queueTransactionAtom, [
      ...txRef,
      {
        ...value,
        id,
        removeItem,
        rpc:
          (value as QueueTxRpc).rpc || jsonrpc.author.submitAndWatchExtrinsic,
        status: 'queued'
      }
    ]);
    _set(queueIdAtom, id + 1);
  }
);

export const queueSetTransactionStatusAtom = atom(
  null,
  (_get, _set, value: QueueActionSetTransaction) => {
    const { id, status, result, error } = value;
    const txRef = _get(queueTransactionAtom);

    _set(queueTransactionAtom, [
      ...txRef.map(
        (item): QueueTx =>
          item.id === id
            ? {
                ...item,
                error: error === undefined ? item.error : error,
                result:
                  result === undefined
                    ? (item.result as SubmittableResult)
                    : result,
                status: item.status === 'completed' ? item.status : status
              }
            : item
      )
    ]);

    // queueAction(extractEvents(result));

    if (STATUS_COMPLETE.includes(status)) {
      setTimeout((): void => {
        const item = txRef.find((x) => x.id === id);

        if (item) {
          item.removeItem();
        }
      }, REMOVE_TIMEOUT);
    }
  }
);
