import type { SubmittableResult } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import type { SignerResult } from '@polkadot/api/types';
import type { AccountId, Address } from '@polkadot/types/interfaces';
import type {
  DefinitionRpcExt,
  Registry,
  SignerPayloadJSON
} from '@polkadot/types/types';

export interface AddressProxy {
  isMultiCall: boolean;
  isUnlockCached: boolean;
  multiRoot: string | null;
  proxyRoot: string | null;
  signAddress: string | null;
  signPassword: string;
}

export type Actions =
  | 'create'
  | 'edit'
  | 'restore'
  | 'forget'
  | 'backup'
  | 'changePassword'
  | 'transfer';

export interface ActionStatusBase {
  account?: AccountId | Address | string;
  message?: string;
  status: 'error' | 'event' | 'eventWarn' | 'queued' | 'received' | 'success';
}

export interface ActionStatusPartial extends ActionStatusBase {
  action: Actions | string;
}

export interface ActionStatus extends ActionStatusBase {
  action: Actions | string | string[];
}

export interface AccountInfo {
  accountId?: string | null;
}

export type QueueTxStatus =
  | 'future'
  | 'ready'
  | 'finalized'
  | 'finalitytimeout'
  | 'usurped'
  | 'dropped'
  | 'inblock'
  | 'invalid'
  | 'broadcast'
  | 'cancelled'
  | 'completed'
  | 'error'
  | 'incomplete'
  | 'queued'
  | 'qr'
  | 'retracted'
  | 'sending'
  | 'signing'
  | 'sent'
  | 'blocked';

export type SignerCallback = (id: number, result: SignerResult | null) => void;

export type TxCallback = (status: SubmittableResult) => void;

export type TxFailedCallback = (
  status: Error | SubmittableResult | null
) => void;

export interface QueueTx extends AccountInfo {
  error?: Error;
  extrinsic?: SubmittableExtrinsic;
  id: number;
  isUnsigned?: boolean;
  payload?: SignerPayloadJSON;
  result?: any;
  removeItem: () => void;
  rpc: DefinitionRpcExt;
  signerCb?: SignerCallback;
  txFailedCb?: TxFailedCallback;
  txSuccessCb?: TxCallback;
  txStartCb?: () => void;
  txUpdateCb?: TxCallback;
  values?: unknown[];
  status: QueueTxStatus;
}

export interface QueueStatus extends ActionStatus {
  id: number;
  isCompleted: boolean;
  removeItem: () => void;
}

export interface QueueTxResult {
  error?: Error;
  result?: any;
  status: QueueTxStatus;
}

export interface QueueTxExtrinsic extends AccountInfo {
  extrinsic?: SubmittableExtrinsic;
}

export interface QueueTxRpc extends AccountInfo {
  rpc: DefinitionRpcExt;
  values: unknown[];
}

export interface PartialAccountInfo {
  accountId?: string | null;
}

export interface PartialQueueTxExtrinsic extends PartialAccountInfo {
  extrinsic?: SubmittableExtrinsic;
  payload?: SignerPayloadJSON;
  signerCb?: SignerCallback;
  txFailedCb?: TxFailedCallback;
  txSuccessCb?: TxCallback;
  txStartCb?: () => void;
  txUpdateCb?: TxCallback;
  isUnsigned?: boolean;
}

export interface PartialQueueTxRpc extends PartialAccountInfo {
  rpc: DefinitionRpcExt;
  values: unknown[];
}

export type QueueTxRpcAdd = (value: PartialQueueTxRpc) => void;

export type QueueTxExtrinsicAdd = (value: PartialQueueTxExtrinsic) => void;

export type QueueTxPayloadAdd = (
  registry: Registry,
  payload: SignerPayloadJSON,
  signerCb: SignerCallback
) => void;

export type QueueActionAdd = (status: ActionStatus | ActionStatus[]) => void;

export type QueueActionSetTransaction = {
  id: number;
  status: QueueTxStatus;
  result?: SubmittableResult;
  error?: Error;
};

export type QueueTxMessageSetStatus = (
  update: QueueActionSetTransaction
) => void;

export interface AddressFlags {
  accountOffset: number;
  addressOffset: number;
  hardwareType?: string;
  isHardware: boolean;
  isMultisig: boolean;
  isProxied: boolean;
  isQr: boolean;
  isUnlockable: boolean;
  threshold: number;
  who: string[];
}
