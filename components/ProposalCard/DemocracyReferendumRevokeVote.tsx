import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import { metamaskAccountAtom, substrateAccountAtom } from 'store/account';

import { useDaoDemocracyContract } from 'hooks/useDaoDemocracyContract';
import type { DemocracyReferendumMeta, TxFailedCallback } from 'types';

import { Notification } from 'components/ui-kit/Notifications';
import { TxButton } from 'components/TxButton';
import { Button } from 'components/ui-kit/Button';
import { Typography } from 'components/ui-kit/Typography';

import { currentDaoAtom } from 'store/dao';
import { evmToAddress } from '@polkadot/util-crypto';
import { Voting } from '@polkadot/types/interfaces';
import { extractError } from 'utils/errors';

import styles from './ProposalCard.module.scss';

type DemocracyReferendumRevokeVoteProps = {
  proposal: DemocracyReferendumMeta;
};

export function DemocracyReferendumRevokeVote({
  proposal
}: DemocracyReferendumRevokeVoteProps) {
  const api = useAtomValue(apiAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);

  const daoDemocracyContract = useDaoDemocracyContract();

  const [revokeEnabled, setRevokeEnabled] = useState<boolean>(false);

  useEffect(() => {
    let unsubscribe: any;
    let accountId: string | undefined;

    if (substrateAccount) {
      accountId = substrateAccount.address;
    }

    if (metamaskAccount?._address) {
      accountId = evmToAddress(metamaskAccount._address);
    }

    if (!currentDao || !accountId) {
      return undefined;
    }

    api?.query.daoDemocracy
      .votingOf(currentDao?.id, accountId, (votingCodec: Voting) => {
        const voting = votingCodec.toHuman();
        // TODO: handle delegating case
        if (votingCodec.isDirect) {
          const { votes } = (voting as any).Direct || [];

          if (!votes.length) {
            setRevokeEnabled(false);

            return;
          }

          // TODO: handle vote/conviction pair
          setRevokeEnabled(
            votes.filter(([refIndex]: any) => refIndex === `${proposal.index}`)
              .length
          );
        }
      })
      .then((unsub) => {
        unsubscribe = unsub;
      });

    return () => unsubscribe && unsubscribe();
  }, [
    api?.query.daoDemocracy,
    currentDao,
    currentDao?.id,
    metamaskAccount,
    substrateAccount,
    proposal.index,
    setRevokeEnabled
  ]);

  const onSuccess = () => {
    toast.success(
      <Notification
        title="Revoked"
        body="You have revoked vote."
        variant="success"
      />
    );
  };

  const onFailed: TxFailedCallback = (result) =>
    toast.error(
      <Notification
        title="Transaction failed"
        body={extractError(api, result)}
        variant="error"
      />
    );

  const handleRevokeVote = async () => {
    if (!metamaskAccount) {
      return;
    }

    try {
      await daoDemocracyContract
        ?.connect(metamaskAccount)
        .removeVote(proposal.dao.id, proposal.index);
      onSuccess();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      onFailed(null);
    }
  };

  return metamaskAccount ? (
    <Button
      className={styles['democracy-modal-button']}
      variant="filled"
      onClick={handleRevokeVote}
      disabled={!revokeEnabled}
    >
      Revoke Vote
    </Button>
  ) : (
    <TxButton
      className={styles['democracy-modal-button']}
      accountId={substrateAccount?.address}
      tx={api?.tx.daoDemocracy.removeVote}
      params={[proposal.dao.id, proposal.index]}
      variant="outlined"
      disabled={!revokeEnabled}
      onSuccess={onSuccess}
      onFailed={(result) => onFailed(result)}
    >
      <Typography variant="button1">Revoke Vote</Typography>
    </TxButton>
  );
}
