import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useDaoCollectiveContract } from 'hooks/useDaoCollectiveContract';
import { useDaoDemocracyContract } from 'hooks/useDaoDemocracyContract';

import { useAtomValue } from 'jotai';
import { apiAtom, keyringAtom } from 'store/api';
import {
  accountsAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';
import { currentDaoAtom } from 'store/dao';

import { LENGTH_BOUND } from 'constants/transaction';
import { evmToAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { stringToHex } from '@polkadot/util';
import { keyringAddExternal } from 'utils/keyringAddExternal';

import type { Vec } from '@polkadot/types';
import type { AccountId } from '@polkadot/types/interfaces';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { Dao } from 'types';

import { Button } from 'components/ui-kit/Button';
import { Typography } from 'components/ui-kit/Typography';
import { TxButton } from 'components/TxButton';
import { Notification } from 'components/ui-kit/Notifications';
import { Icon } from 'components/ui-kit/Icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from 'components/ui-kit/Dialog';

import { ProposalEnum, ProposalVotingAccessEnum, State } from './types';
import styles from './CreateProposal.module.scss';
import { ProposalType } from './ProposalType';
import { ProposalInputs } from './ProposalInputs';
import { ProposalVotingAccess } from './ProposalVotingAccess';

const INITIAL_STATE: State = {
  amount: '',
  description: '',
  target: '',
  title: '',
  balance: ''
};

export function CreateProposal() {
  const [modalOpen, setModalOpen] = useState(false);

  const [proposalVotingAccess, setProposalVotingAccess] =
    useState<ProposalVotingAccessEnum | null>(null);
  const [proposalType, setProposalType] = useState<ProposalEnum | null>(null);

  const [members, setMembers] = useState<KeyringPair[]>([]);
  const api = useAtomValue(apiAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const accounts = useAtomValue(accountsAtom);
  const keyring = useAtomValue(keyringAtom);
  const currentDao = useAtomValue(currentDaoAtom);

  const daoCollectiveContract = useDaoCollectiveContract();
  const daoDemocracyContract = useDaoDemocracyContract();

  const [state, setState] = useState<State>(INITIAL_STATE);

  const extrinsic = useMemo(() => {
    if (proposalVotingAccess === ProposalVotingAccessEnum.Council) {
      return api?.tx.daoCouncil.proposeWithMeta;
    }
    return api?.tx.daoDemocracy.proposeWithMeta;
  }, [api, proposalVotingAccess]);

  useEffect(() => {
    let unsubscribe: any | null = null;

    if (!currentDao) {
      return undefined;
    }

    api?.query.daoCouncil
      .members(currentDao.id, (_members: Vec<AccountId>) => {
        setMembers(
          _members.map((_member) => ({
            ...accounts?.find(
              (_account) => _account.address === _member.toString()
            )!
          }))
        );
      })
      .then((unsub) => {
        unsubscribe = unsub;
      })
      // eslint-disable-next-line no-console
      .catch(console.error);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [accounts, api, currentDao]);

  const getProposalTx = useCallback(
    (_currentDao: Dao) => {
      const target = isEthereumAddress(state.target)
        ? evmToAddress(state.target)
        : state.target;

      const amount = parseInt(state.amount, 10);

      switch (proposalType) {
        case ProposalEnum.PROPOSE_ADD_MEMBER: {
          return api?.tx.daoCouncilMembers.addMember(_currentDao.id, target);
        }
        case ProposalEnum.PROPOSE_REMOVE_MEMBER: {
          return api?.tx.daoCouncilMembers.removeMember(_currentDao.id, target);
        }
        case ProposalEnum.PROPOSE_TRANSFER: {
          return api?.tx.daoTreasury.spend(_currentDao.id, amount, target);
        }
        case ProposalEnum.PROPOSE_TRANSFER_GOVERNANCE_TOKEN: {
          return api?.tx.daoTreasury.transferToken(
            currentDao?.id,
            amount,
            target
          );
        }
        default: {
          throw new Error('No such extrinsic method exists.');
        }
      }
    },
    [
      api?.tx.daoCouncilMembers,
      api?.tx.daoTreasury,
      currentDao?.id,
      proposalType,
      state.amount,
      state.target
    ]
  );

  const proposalCreatedHandler = useCallback(() => {
    setTimeout(
      () =>
        toast.success(
          <Notification
            title="Proposal created"
            body="Proposal was created."
            variant="success"
          />
        ),
      1000
    );
    setProposalVotingAccess(null);
    setProposalType(null);
    setState(INITIAL_STATE);
    setModalOpen(false);
  }, []);

  const handleCancelClick = () => setModalOpen(false);

  const handleTransform = useCallback(() => {
    if (!currentDao) {
      throw new Error('Current DAO does not exist');
    }
    const meta = stringToHex(
      JSON.stringify({
        title: state.title.trim(),
        description: state.description.trim()
      })
    );

    const _tx = getProposalTx(currentDao);

    if (proposalVotingAccess === ProposalVotingAccessEnum.Council) {
      return [currentDao.id, _tx, LENGTH_BOUND, meta];
    }

    return [
      currentDao.id,
      { Inline: _tx?.method.toHex() },
      state.balance,
      meta
    ];
  }, [
    currentDao,
    getProposalTx,
    proposalVotingAccess,
    state.balance,
    state.description,
    state.title
  ]);

  const disabled =
    !proposalVotingAccess ||
    !proposalType ||
    !state.title ||
    !state.description ||
    ((proposalType === ProposalEnum.PROPOSE_TRANSFER ||
      proposalType === ProposalEnum.PROPOSE_TRANSFER_GOVERNANCE_TOKEN) &&
      (!state.amount || !state.target)) ||
    ((proposalType === ProposalEnum.PROPOSE_ADD_MEMBER ||
      proposalType === ProposalEnum.PROPOSE_REMOVE_MEMBER) &&
      !state.target);

  const onSuccess = () => proposalCreatedHandler();

  const handleProposeClick = async () => {
    if (!metamaskAccount || !keyring || !currentDao) {
      return;
    }

    const meta = stringToHex(
      JSON.stringify({
        title: state.title.trim(),
        description: state.description.trim()
      })
    );

    try {
      const _tx = getProposalTx(currentDao);

      if (proposalVotingAccess === ProposalVotingAccessEnum.Council) {
        await daoCollectiveContract
          ?.connect(metamaskAccount)
          .propose_with_meta(currentDao.id, _tx?.method.toHex(), meta);
      }
      if (proposalVotingAccess === ProposalVotingAccessEnum.Democracy) {
        await daoDemocracyContract
          ?.connect(metamaskAccount)
          .propose_with_meta(
            currentDao.id,
            _tx?.method.toHex(),
            state.amount,
            meta
          );
      }

      proposalCreatedHandler();

      if (isEthereumAddress(state.target)) {
        keyringAddExternal(keyring, state.target);
      }
      toast.success(
        <Notification
          title="Transaction created"
          body="Proposal will be created soon."
          variant="success"
        />
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);

      toast.error(
        <Notification
          title="Transaction declined"
          body="Transaction was declined."
          variant="error"
        />
      );
    }
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button>
          <span className={styles['button-content']}>
            <Icon name="proposals-add" size="sm" />
            <Typography variant="button1">Create Proposal</Typography>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className={styles['dialog-content']} closeIcon={false}>
        <DialogTitle asChild>
          <Typography className={styles.title} variant="title1">
            Create Proposal
          </Typography>
        </DialogTitle>
        <DialogDescription asChild>
          <div className={styles.container}>
            <div className={styles.content}>
              <div className={styles['proposal-settings']}>
                <ProposalVotingAccess
                  setProposalVotingAccess={setProposalVotingAccess}
                />
                <ProposalType setProposalType={setProposalType} />
              </div>
              <ProposalInputs
                proposalVotingAccess={proposalVotingAccess}
                proposalType={proposalType}
                state={state}
                setState={setState}
                members={members}
              />
              <div className={styles['buttons-container']}>
                <Button
                  variant="outlined"
                  color="destructive"
                  onClick={handleCancelClick}
                >
                  Cancel
                </Button>

                {metamaskAccount ? (
                  <Button onClick={handleProposeClick} disabled={disabled}>
                    Submit
                  </Button>
                ) : (
                  <TxButton
                    accountId={substrateAccount?.address}
                    params={handleTransform}
                    disabled={disabled}
                    tx={extrinsic}
                    onSuccess={onSuccess}
                  >
                    Submit
                  </TxButton>
                )}
              </div>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
