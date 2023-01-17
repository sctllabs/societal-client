/* eslint-disable no-console */
import { appConfig } from 'config';
import type { Keyring } from '@polkadot/ui-keyring';
import type { Option } from '@polkadot/types';
import type { ApiPromise, SubmittableResult } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { Multisig, Timepoint } from '@polkadot/types/interfaces';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { SignerOptions } from '@polkadot/api/submittable/types';
import type { InjectedWindow } from '@polkadot/extension-inject/types';

import type {
  QueueTx,
  QueueTxMessageSetStatus,
  AddressProxy,
  AddressFlags,
  QueueTxStatus
} from 'types';

import { assert } from '@polkadot/util';
import { addressEq } from '@polkadot/util-crypto';

import { AccountSigner, lockCountdown } from 'utils/accountSigner';

const NOOP = () => undefined;

export async function extractParams(
  api: ApiPromise,
  keyring: Keyring,
  address: string,
  options: Partial<SignerOptions>
): Promise<['qr' | 'signing', string, Partial<SignerOptions>]> {
  const pair = keyring.getPair(address);
  const {
    meta: { isInjected, source }
  } = pair;

  if (isInjected) {
    const injectedWindow = window as Window & InjectedWindow;
    if (!injectedWindow || !injectedWindow.injectedWeb3[source as string]) {
      throw new Error('Polkadot.js wallet is not installed.');
    }
    const provider = injectedWindow.injectedWeb3[source as string];
    const injected = await provider.enable(appConfig.appName);

    assert(injected, `Unable to find a signer for ${address}`);

    return ['signing', address, { ...options, signer: injected.signer }];
  }

  assert(
    addressEq(address, pair.address),
    `Unable to retrieve keypair for ${address}`
  );

  return [
    'signing',
    address,
    { ...options, signer: new AccountSigner(api.registry, pair) }
  ];
}

export function handleTxResults(
  handler: 'send' | 'signAndSend',
  queueSetTxStatus: QueueTxMessageSetStatus,
  { id, txFailedCb = NOOP, txSuccessCb = NOOP, txUpdateCb = NOOP }: QueueTx,
  unsubscribe: () => void
): (result: SubmittableResult) => void {
  return (result: SubmittableResult): void => {
    if (!result || !result.status) {
      return;
    }

    const status = result.status.type.toLowerCase() as QueueTxStatus;

    console.log(`${handler}: status :: ${JSON.stringify(result)}`);

    queueSetTxStatus({ id, status, result });
    txUpdateCb(result);

    if (result.status.isFinalized || result.status.isInBlock) {
      result.events
        .filter(({ event: { section } }) => section === 'system')
        .forEach(({ event: { method } }): void => {
          if (method === 'ExtrinsicFailed') {
            txFailedCb(result);
          } else if (method === 'ExtrinsicSuccess') {
            txSuccessCb(result);
          }
        });
    } else if (result.isError) {
      txFailedCb(result);
    }

    if (result.isCompleted) {
      unsubscribe();
    }
  };
}

const NO_FLAGS = {
  accountOffset: 0,
  addressOffset: 0,
  isHardware: false,
  isMultisig: false,
  isProxied: false,
  isQr: false,
  isUnlockable: false,
  threshold: 0,
  who: []
};

export function recodeAddress(
  address: string | Uint8Array,
  keyring: Keyring
): string {
  return keyring.encodeAddress(keyring.decodeAddress(address));
}

export function extractExternal(
  accountId: string | null,
  keyring: Keyring
): AddressFlags {
  if (!accountId) {
    return NO_FLAGS;
  }

  let publicKey;

  try {
    publicKey = keyring.decodeAddress(accountId);
  } catch (error) {
    console.error(error);

    return NO_FLAGS;
  }

  const pair = keyring.getPair(publicKey);
  const { isExternal, isHardware, isInjected, isMultisig, isProxied } =
    pair.meta;
  const isUnlockable = !isExternal && !isHardware && !isInjected;

  if (isUnlockable) {
    const entry = lockCountdown[pair.address];

    if (entry && Date.now() > entry && !pair.isLocked) {
      pair.lock();
      lockCountdown[pair.address] = 0;
    }
  }

  return {
    accountOffset: (pair.meta.accountOffset as number) || 0,
    addressOffset: (pair.meta.addressOffset as number) || 0,
    hardwareType: pair.meta.hardwareType as string,
    isHardware: !!isHardware,
    isMultisig: !!isMultisig,
    isProxied: !!isProxied,
    isQr:
      !!isExternal && !isMultisig && !isProxied && !isHardware && !isInjected,
    isUnlockable: isUnlockable && pair.isLocked,
    threshold: (pair.meta.threshold as number) || 0,
    who: ((pair.meta.who as string[]) || []).map((x) =>
      recodeAddress(x, keyring)
    )
  };
}

export async function wrapTx(
  api: ApiPromise,
  keyring: Keyring,
  currentItem: QueueTx,
  { isMultiCall, multiRoot, proxyRoot, signAddress }: AddressProxy
): Promise<SubmittableExtrinsic<'promise'>> {
  let tx = currentItem.extrinsic as SubmittableExtrinsic<'promise'>;

  if (proxyRoot) {
    tx = api.tx.proxy.proxy(proxyRoot, null, tx);
  }

  if (multiRoot) {
    const multiModule = api.tx.multisig ? 'multisig' : 'utility';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [info, { weight }] = await Promise.all([
      api.query[multiModule].multisigs<Option<Multisig>>(
        multiRoot,
        tx.method.hash
      ),
      tx.paymentInfo(multiRoot)
    ]);

    console.log(
      'multisig max weight=',
      (weight as unknown as string).toString()
    );

    const { threshold, who } = extractExternal(multiRoot, keyring);
    const others = who.filter((w: string) => w !== signAddress);
    let timepoint: Timepoint | null = null;

    if (info.isSome) {
      timepoint = info.unwrap().when;
    }

    if (isMultiCall) {
      if (api.tx[multiModule].asMulti.meta.args.length === 5) {
        tx = api.tx[multiModule].asMulti(
          threshold,
          others,
          timepoint,
          tx.method.toHex(),
          weight
        );
      } else {
        tx =
          api.tx[multiModule].asMulti.meta.args.length === 6
            ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              api.tx[multiModule].asMulti(
                threshold,
                others,
                timepoint,
                tx.method.toHex(),
                false,
                weight
              )
            : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              api.tx[multiModule].asMulti(
                threshold,
                others,
                timepoint,
                tx.method
              );
      }
    } else {
      tx =
        api.tx[multiModule].approveAsMulti.meta.args.length === 5
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            api.tx[multiModule].approveAsMulti(
              threshold,
              others,
              timepoint,
              tx.method.hash,
              weight
            )
          : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            api.tx[multiModule].approveAsMulti(
              threshold,
              others,
              timepoint,
              tx.method.hash
            );
    }
  }

  return tx;
}

export async function signAndSend(
  queueSetTxStatus: QueueTxMessageSetStatus,
  currentItem: QueueTx,
  tx: SubmittableExtrinsic<'promise'>,
  pairOrAddress: KeyringPair | string,
  options: Partial<SignerOptions>
): Promise<void> {
  if (currentItem.txStartCb) {
    currentItem.txStartCb();
  }

  try {
    await tx.signAsync(pairOrAddress, options);

    console.info('sending', tx.toHex());

    queueSetTxStatus({ id: currentItem.id, status: 'sending' });

    const unsubscribe = await tx.send(
      handleTxResults(
        'signAndSend',
        queueSetTxStatus,
        currentItem,
        (): void => {
          unsubscribe();
        }
      )
    );
  } catch (error) {
    console.error('signAndSend: error:', error);
    queueSetTxStatus({
      id: currentItem.id,
      status: 'error',
      error: error as Error
    });

    if (currentItem.txFailedCb) {
      currentItem.txFailedCb(error as Error);
    }
  }
}
