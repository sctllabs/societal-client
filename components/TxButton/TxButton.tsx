import {
  useCallback,
  useEffect,
  useState,
  MutableRefObject,
  ReactNode,
  MouseEvent,
  MouseEventHandler
} from 'react';

import { useSetAtom } from 'jotai';
import { queueExtrinsicAtom } from 'store/queue';
import { assert, isFunction } from '@polkadot/util';

import type { SubmittableResult } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { TxCallback, TxFailedCallback } from 'types';
import type { AccountId } from '@polkadot/types/interfaces';

import { Button, ButtonProps } from 'components/ui-kit/Button';

export interface TxButtonProps extends ButtonProps {
  accountId?: AccountId | string | null;
  className?: string;
  extrinsic?:
    | SubmittableExtrinsic<'promise'>
    | SubmittableExtrinsic<'promise'>[]
    | null;
  unsigned?: boolean;
  onClick?: MouseEventHandler;
  onFailed?: TxFailedCallback;
  onSendRef?: MutableRefObject<
    ((e: MouseEvent<HTMLButtonElement>) => void) | undefined
  >;
  onStart?: () => void;
  onSuccess?: TxCallback;
  onUpdate?: TxCallback;
  params?: unknown[] | (() => unknown[]) | null;
  tx?: ((...args: any[]) => SubmittableExtrinsic<'promise'>) | null;
  children: ReactNode;
}

export function TxButton({
  accountId,
  className = '',
  extrinsic: propsExtrinsic,
  // isBusy,
  onClick,
  onFailed,
  onSendRef,
  onStart,
  onSuccess,
  onUpdate,
  params,
  tx,
  unsigned = false,
  disabled = false,
  children,
  ...otherProps
}: TxButtonProps) {
  const queueExtrinsic = useSetAtom(queueExtrinsicAtom);
  const [isSending, setIsSending] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  useEffect((): void => {
    if (!isStarted || !onStart) {
      return;
    }

    onStart();
  }, [isStarted, onStart]);

  const _onFailed = useCallback(
    (result: Error | SubmittableResult | null): void => {
      setIsSending(false);

      if (!onFailed) {
        return;
      }

      onFailed(result);
    },
    [onFailed, setIsSending]
  );

  const _onSuccess = useCallback(
    (result: SubmittableResult): void => {
      setIsSending(false);

      if (onSuccess) {
        onSuccess(result);
      }
    },
    [onSuccess, setIsSending]
  );

  const _onStart = useCallback((): void => {
    setIsStarted(true);
  }, [setIsStarted]);

  const _onSend = useCallback(
    (e: MouseEvent<HTMLButtonElement>): void => {
      let extrinsics: SubmittableExtrinsic<'promise'>[] | undefined;

      if (propsExtrinsic) {
        extrinsics = Array.isArray(propsExtrinsic)
          ? propsExtrinsic
          : [propsExtrinsic];
      } else if (tx) {
        extrinsics = [tx(...(isFunction(params) ? params() : params || []))];
      }

      assert(
        extrinsics?.length,
        'Expected generated extrinsic passed to TxButton'
      );

      setIsSending(true);

      extrinsics.forEach((extrinsic): void => {
        queueExtrinsic({
          accountId: accountId && accountId.toString(),
          extrinsic,
          unsigned,
          txFailedCb: _onFailed,
          txStartCb: _onStart,
          txSuccessCb: _onSuccess,
          txUpdateCb: onUpdate
        });
      });

      if (!onClick) {
        return;
      }
      onClick(e);
    },
    [
      _onFailed,
      _onStart,
      _onSuccess,
      accountId,
      unsigned,
      onClick,
      onUpdate,
      params,
      propsExtrinsic,
      queueExtrinsic,
      setIsSending,
      tx
    ]
  );

  if (onSendRef) {
    // eslint-disable-next-line no-param-reassign
    onSendRef.current = _onSend;
  }

  return (
    <Button
      className={className}
      // isBusy={isBusy}
      disabled={
        isSending ||
        disabled ||
        (!unsigned && !accountId) ||
        // eslint-disable-next-line no-nested-ternary
        (tx
          ? false
          : Array.isArray(propsExtrinsic)
          ? propsExtrinsic.length === 0
          : !propsExtrinsic)
      }
      onClick={_onSend}
      {...otherProps}
    >
      {children}
    </Button>
  );
}
