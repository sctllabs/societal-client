import type { QueueTxStatus } from 'types';

export const LENGTH_BOUND = 100000;

export const PROPOSAL_WEIGHT_BOUND = [100000000000, 0];

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
