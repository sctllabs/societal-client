import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import { metamaskAccountAtom, substrateAccountAtom } from 'store/account';

import { useDaoDemocracyContract } from 'hooks/useDaoDemocracyContract';
import type { DemocracyReferendumMeta } from 'types';

import { Notification } from 'components/ui-kit/Notifications';
import { TxButton } from 'components/TxButton';
import { Button } from 'components/ui-kit/Button';
import { Typography } from 'components/ui-kit/Typography';

import styles from './ProposalCard.module.scss';

type DemocracyReferendumRevokeVoteProps = {
  proposal: DemocracyReferendumMeta;
};

export function DemocracyReferendumRevokeVote({
  proposal
}: DemocracyReferendumRevokeVoteProps) {
  const api = useAtomValue(apiAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);

  const daoDemocracyContract = useDaoDemocracyContract();

  const onSuccess = () => {
    toast.success(
      <Notification
        title="Revoked"
        body="You have revoked vote."
        variant="success"
      />
    );
  };

  const onFailed = () =>
    toast.error(
      <Notification
        title="Transaction failed"
        body="Transaction Failed"
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
      onFailed();
    }
  };

  return metamaskAccount ? (
    <Button
      className={styles['democracy-modal-button']}
      variant="filled"
      onClick={handleRevokeVote}
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
      onSuccess={onSuccess}
      onFailed={onFailed}
    >
      <Typography variant="button1">Revoke Vote</Typography>
    </TxButton>
  );
}
