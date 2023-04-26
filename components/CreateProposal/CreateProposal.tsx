import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useDaoCollectiveContract } from 'hooks/useDaoCollectiveContract';
import { useDaoDemocracyContract } from 'hooks/useDaoDemocracyContract';
import { useDaoEthGovernanceContract } from 'hooks/useDaoEthGovernanceContract';

import { useAtomValue } from 'jotai';
import {
  apiAtom,
  chainDecimalsAtom,
  chainSymbolAtom,
  keyringAtom
} from 'store/api';
import {
  accountsAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';
import { currentDaoAtom } from 'store/dao';
import { tokenDecimalsAtom } from 'store/token';

import { LENGTH_BOUND } from 'constants/transaction';
import { evmToAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { stringToHex } from '@polkadot/util';
import { keyringAddExternal } from 'utils/keyringAddExternal';

import type { Vec } from '@polkadot/types';
import type { AccountId } from '@polkadot/types/interfaces';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { Dao, TxFailedCallback } from 'types';

import { Button, ButtonColor, ButtonVariant } from 'components/ui-kit/Button';
import { Typography } from 'components/ui-kit/Typography';
import { TxButton } from 'components/TxButton';
import { Notification } from 'components/ui-kit/Notifications';
import { Icon, IconNamesType } from 'components/ui-kit/Icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from 'components/ui-kit/Dialog';

import {
  BountyProposalEnum,
  ProposalBasicState,
  ProposalEnum,
  ProposalVariant,
  ProposalVotingAccessEnum,
  State
} from './types';
import styles from './CreateProposal.module.scss';
import { ProposalType } from './ProposalType';
import { ProposalInputs } from './ProposalInputs';
import { ProposalVotingAccess } from './ProposalVotingAccess';
import { ProposalBasicInputs } from './ProposalBasicInputs';

type CreateProposalProps = {
  proposalType?: ProposalEnum | BountyProposalEnum;
  proposalVariant: ProposalVariant;
  bountyIndex?: string;
  buttonText?: string;
  icon?: IconNamesType;
  buttonVariant?: ButtonVariant;
  buttonColor?: ButtonColor;
};

const INITIAL_STATE: State = {
  amount: '',
  target: '',
  balance: '',
  bountyIndex: undefined
};

const INITIAL_BASIC_STATE: ProposalBasicState = {
  title: '',
  description: ''
};

export function CreateProposal({
  proposalVariant,
  proposalType: _proposalType,
  bountyIndex,
  buttonText,
  icon,
  buttonVariant,
  buttonColor
}: CreateProposalProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const [proposalVotingAccess, setProposalVotingAccess] =
    useState<ProposalVotingAccessEnum | null>(null);
  const [proposalType, setProposalType] = useState<
    ProposalEnum | BountyProposalEnum | undefined
  >(undefined);
  const [proposalBasicState, setProposalBasicState] =
    useState(INITIAL_BASIC_STATE);
  const [state, setState] = useState<State>(INITIAL_STATE);
  const [members, setMembers] = useState<KeyringPair[]>([]);
  const [currency, setCurrency] = useState<string | null>(null);

  const api = useAtomValue(apiAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const accounts = useAtomValue(accountsAtom);
  const keyring = useAtomValue(keyringAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const chainSymbol = useAtomValue(chainSymbolAtom);
  const chainDecimals = useAtomValue(chainDecimalsAtom);
  const tokenDecimals = useAtomValue(tokenDecimalsAtom);

  const daoCollectiveContract = useDaoCollectiveContract();
  const daoDemocracyContract = useDaoDemocracyContract();
  const daoEthGovernanceContract = useDaoEthGovernanceContract();

  useEffect(() => {
    if (!chainSymbol) {
      return;
    }

    setCurrency(chainSymbol);
  }, [chainSymbol]);

  const extrinsic = useMemo(() => {
    switch (proposalVotingAccess) {
      case ProposalVotingAccessEnum.Council:
        return api?.tx.daoCouncil.proposeWithMeta;
      case ProposalVotingAccessEnum.Democracy:
        return api?.tx.daoDemocracy.proposeWithMeta;
      case ProposalVotingAccessEnum.EthGovernance:
        return api?.tx.daoEthGovernance.proposeWithMeta;
      default:
        return api?.tx.daoCouncil.proposeWithMeta;
    }
  }, [api, proposalVotingAccess]);

  useEffect(() => {
    let unsubscribe: any;

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

    return () => unsubscribe && unsubscribe();
  }, [accounts, api, currentDao]);

  const getProposalTx = useCallback(
    (_currentDao: Dao) => {
      const target = isEthereumAddress(state.target)
        ? evmToAddress(state.target)
        : state.target;

      const decimals =
        proposalType === ProposalEnum.TRANSFER_GOVERNANCE_TOKEN
          ? tokenDecimals
          : chainDecimals;

      const amount = parseInt(state.amount, 10) * 10 ** (decimals || 0);
      switch (proposalType) {
        case ProposalEnum.ADD_MEMBER: {
          return api?.tx.daoCouncilMembers.addMember(_currentDao.id, target);
        }
        case ProposalEnum.REMOVE_MEMBER: {
          return api?.tx.daoCouncilMembers.removeMember(_currentDao.id, target);
        }
        case ProposalEnum.TRANSFER: {
          return api?.tx.daoTreasury.spend(_currentDao.id, amount, target);
        }
        case ProposalEnum.TRANSFER_GOVERNANCE_TOKEN: {
          return api?.tx.daoTreasury.transferToken(
            currentDao?.id,
            amount,
            target
          );
        }
        case BountyProposalEnum.BOUNTY: {
          const description = stringToHex(
            JSON.stringify({
              title: proposalBasicState.title.trim(),
              description: proposalBasicState.description.trim()
            })
          );
          if (currency === chainSymbol) {
            return api?.tx.daoBounties.createBounty(
              currentDao?.id,
              amount,
              description
            );
          }
          return api?.tx.daoBounties.createTokenBounty(
            currentDao?.id,
            currentDao?.fungibleToken.id,
            amount,
            description
          );
        }
        case BountyProposalEnum.BOUNTY_CURATOR: {
          return api?.tx.daoBounties.proposeCurator(
            currentDao?.id,
            state.bountyIndex,
            target,
            amount
          );
        }
        case BountyProposalEnum.BOUNTY_UNASSIGN_CURATOR: {
          return api?.tx.daoBounties.unassignCurator(
            currentDao?.id,
            state.bountyIndex
          );
        }
        default: {
          throw new Error('No such extrinsic method exists.');
        }
      }
    },
    [
      state.target,
      state.amount,
      state.bountyIndex,
      proposalType,
      api?.tx.daoCouncilMembers,
      api?.tx.daoTreasury,
      api?.tx.daoBounties,
      currentDao?.id,
      currentDao?.fungibleToken?.id,
      proposalBasicState.title,
      proposalBasicState.description,
      currency,
      chainSymbol,
      chainDecimals,
      tokenDecimals
    ]
  );

  useEffect(() => {
    setProposalType(_proposalType);
    setProposalBasicState(INITIAL_BASIC_STATE);
    setState({ ...INITIAL_STATE, bountyIndex });
  }, [_proposalType, bountyIndex, modalOpen]);

  const onSuccess = useCallback(() => {
    setProposalVotingAccess(null);
    setProposalType(undefined);
    setModalOpen(false);
    toast.success(
      <Notification
        title="Proposal created"
        body="Proposal was created."
        variant="success"
      />
    );
  }, []);

  const handleCancelClick = () => {
    setProposalVotingAccess(null);
    setProposalType(undefined);
    setModalOpen(false);
  };

  const handleTransform = useCallback(() => {
    if (!currentDao) {
      throw new Error('Current DAO does not exist');
    }
    const meta = stringToHex(
      JSON.stringify({
        title: proposalBasicState.title.trim(),
        description: proposalBasicState.description.trim()
      })
    );

    const _tx = getProposalTx(currentDao);

    switch (proposalVotingAccess) {
      case ProposalVotingAccessEnum.Council:
        return [currentDao.id, _tx, LENGTH_BOUND, meta];
      case ProposalVotingAccessEnum.Democracy:
        return [
          currentDao.id,
          { Inline: _tx?.method.toHex() },
          state.balance,
          meta
        ];
      case ProposalVotingAccessEnum.EthGovernance:
        return [
          currentDao.id,
          _tx,
          LENGTH_BOUND,
          metamaskAccount?._address,
          meta
        ];
      default:
        return [currentDao.id, _tx, LENGTH_BOUND, meta];
    }
  }, [
    currentDao,
    metamaskAccount,
    getProposalTx,
    proposalVotingAccess,
    state.balance,
    proposalBasicState.description,
    proposalBasicState.title
  ]);

  const disabled =
    !proposalVotingAccess ||
    !proposalType ||
    !proposalBasicState.title ||
    !proposalBasicState.description ||
    ((proposalType === ProposalEnum.TRANSFER ||
      proposalType === ProposalEnum.TRANSFER_GOVERNANCE_TOKEN) &&
      (!state.amount || !state.target)) ||
    ((proposalType === ProposalEnum.ADD_MEMBER ||
      proposalType === ProposalEnum.REMOVE_MEMBER) &&
      !state.target) ||
    (proposalType === BountyProposalEnum.BOUNTY_UNASSIGN_CURATOR &&
      state.bountyIndex === undefined);

  const handleProposeClick = async () => {
    if (!metamaskAccount || !keyring || !currentDao) {
      return;
    }

    const meta = stringToHex(
      JSON.stringify({
        title: proposalBasicState.title.trim(),
        description: proposalBasicState.description.trim()
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
            state.balance,
            meta
          );
      }
      if (proposalVotingAccess === ProposalVotingAccessEnum.EthGovernance) {
        await daoEthGovernanceContract
          ?.connect(metamaskAccount)
          .propose_with_meta(
            currentDao.id,
            _tx?.method.toHex(),
            stringToHex(metamaskAccount?._address),
            meta
          );
      }

      onSuccess();

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

  const onFailed: TxFailedCallback = () => {
    toast.error(
      <Notification
        title="Transaction declined"
        body="Transaction was declined."
        variant="error"
      />
    );
  };

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>
        <Button color={buttonColor} variant={buttonVariant}>
          <span className={styles['button-content']}>
            {icon && <Icon name={icon} size="sm" />}
            <Typography variant="button1">{buttonText}</Typography>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className={styles['dialog-content']}>
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
                <ProposalType
                  proposalVariant={proposalVariant}
                  proposalType={proposalType}
                  setProposalType={setProposalType}
                />
              </div>
              <div className={styles['proposal-input-container']}>
                <ProposalBasicInputs
                  state={proposalBasicState}
                  setState={setProposalBasicState}
                />
                <ProposalInputs
                  setCurrency={setCurrency}
                  proposalVotingAccess={proposalVotingAccess}
                  proposalType={proposalType}
                  state={state}
                  setState={setState}
                  members={members}
                />
              </div>
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
                    onFailed={onFailed}
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
