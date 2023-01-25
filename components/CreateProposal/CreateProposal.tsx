import {
  ChangeEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useDaoCollectiveContract } from 'hooks/useDaoCollectiveContract';
import { useDaoTreasuryContract } from 'hooks/useDaoTreasuryContract';

import { useAtomValue } from 'jotai';
import { apiAtom, keyringAtom } from 'store/api';
import {
  accountsAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';

import { LENGTH_BOUND } from 'constants/transaction';
import { u8aToHex } from '@polkadot/util';
import {
  addressToEvm,
  evmToAddress,
  isEthereumAddress
} from '@polkadot/util-crypto';
import { keyringAddExternal } from 'utils/keyringAddExternal';

import type { u32, Vec, Option } from '@polkadot/types';
import type { AccountId } from '@polkadot/types/interfaces';
import type { KeyringPair } from '@polkadot/keyring/types';
import type { TransferCodec } from 'types';

import { Card } from 'components/ui-kit/Card';
import { Icon } from 'components/ui-kit/Icon';
import { RadioGroup } from 'components/ui-kit/Radio/RadioGroup';
import { Button } from 'components/ui-kit/Button';
import { Dropdown } from 'components/ui-kit/Dropdown';
import { Radio } from 'components/ui-kit/Radio/Radio';
import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';
import { MembersDropdown } from 'components/MembersDropdown';
import { TxButton } from 'components/TxButton';
import { Notification } from 'components/ui-kit/Notifications';

import styles from './CreateProposal.module.scss';

export interface CreateProposalProps {
  daoId: string;
}

enum InputName {
  PROPOSAL_TYPE = 'proposalType',
  AMOUNT = 'amount',
  TARGET = 'target'
}

enum InputLabel {
  PROPOSAL_TYPE = 'Choose Proposal Type',
  AMOUNT = 'Amount',
  TARGET = 'Target',
  MEMBER = 'Choose a member'
}

type State = {
  proposalType: string;
  amount: string;
  target: string;
};

export enum ProposalEnum {
  PROPOSE_TRANSFER = 'Propose Transfer',
  PROPOSE_TRANSFER_GOVERNANCE_TOKEN = 'Propose Transfer Governance Token',
  PROPOSE_ADD_MEMBER = 'Propose Add Member',
  PROPOSE_REMOVE_MEMBER = 'Propose Remove Member'
}

const INITIAL_STATE: State = {
  proposalType: '',
  amount: '',
  target: ''
};

export function CreateProposal({ daoId }: CreateProposalProps) {
  const router = useRouter();

  const [members, setMembers] = useState<KeyringPair[]>([]);
  const api = useAtomValue(apiAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const accounts = useAtomValue(accountsAtom);
  const keyring = useAtomValue(keyringAtom);

  const daoTreasuryContract = useDaoTreasuryContract();
  const daoCollectiveContract = useDaoCollectiveContract();

  const [nextTreasuryProposalId, setNextTreasuryProposalId] = useState<
    number | null
  >(null);
  const [proposedTreasuryId, setProposedTreasuryId] = useState<number | null>(
    null
  );

  const [state, setState] = useState<State>(INITIAL_STATE);

  useEffect(() => {
    let unsubscribe: any | null = null;

    api?.query.daoCouncil
      .members(daoId, (_members: Vec<AccountId>) => {
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
  }, [accounts, api, daoId]);

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

    router.push(`/daos/${daoId}`);
  }, [daoId, router]);

  useEffect(() => {
    let unsubscribe: any | null = null;

    if (!proposedTreasuryId) {
      return undefined;
    }

    api?.query.daoTreasury
      .proposals<Option<TransferCodec>>(
        daoId,
        proposedTreasuryId,
        async (_transferProposal: Option<TransferCodec>) => {
          if (_transferProposal.isNone) {
            return;
          }

          if (!metamaskAccount) {
            return;
          }

          const _tx = api?.tx.daoTreasury.approveProposal(
            daoId,
            proposedTreasuryId
          );
          const proposalCallData = _tx?.method.toHex();
          await daoCollectiveContract
            ?.connect(metamaskAccount)
            .propose(daoId, proposalCallData);

          proposalCreatedHandler();
        }
      )
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
  }, [
    api?.query.daoTreasury,
    api?.tx.daoTreasury,
    daoCollectiveContract,
    daoId,
    members.length,
    metamaskAccount,
    proposalCreatedHandler,
    proposedTreasuryId
  ]);

  useEffect(() => {
    let unsubscribe: any | null = null;

    api?.query.daoTreasury
      .proposalCount<u32>(daoId, (x: u32) =>
        setNextTreasuryProposalId(x.toNumber())
      )
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
  });

  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name;
    const targetValue = target.value;

    if (targetName === InputName.PROPOSAL_TYPE) {
      setState({ ...INITIAL_STATE, [targetName]: targetValue });
      return;
    }

    setState((prevState) => ({
      ...prevState,
      [targetName]:
        targetName === InputName.AMOUNT
          ? targetValue.replace(/[^0-9]/g, '')
          : targetValue
    }));
  };

  const handleCancelClick = () => {
    router.push(`/daos/${daoId}`);
  };

  const icon = useMemo(() => {
    switch (state.proposalType) {
      case ProposalEnum.PROPOSE_ADD_MEMBER: {
        return 'user-add';
      }
      case ProposalEnum.PROPOSE_REMOVE_MEMBER: {
        return 'user-delete';
      }
      case ProposalEnum.PROPOSE_TRANSFER: {
        return 'transfer';
      }
      default: {
        return 'transfer';
      }
    }
  }, [state.proposalType]);

  const handleMemberChoose = (target: HTMLUListElement) => {
    const selectedWalletAddress = target.getAttribute('data-address');
    if (!selectedWalletAddress) {
      return;
    }
    setState((prevState) => ({
      ...prevState,
      target: selectedWalletAddress
    }));
  };

  const handleOnClick: MouseEventHandler<HTMLUListElement> = useCallback(
    (e) => handleMemberChoose(e.target as HTMLUListElement),
    []
  );

  const handleOnKeyDown: KeyboardEventHandler<HTMLUListElement> = useCallback(
    (e) => {
      if (e.key !== ' ' && e.key !== 'Enter') {
        return;
      }

      handleMemberChoose(e.target as HTMLUListElement);
    },
    []
  );

  const handleTransform = useCallback(() => {
    if (!members) {
      return [];
    }

    switch (state.proposalType) {
      case ProposalEnum.PROPOSE_ADD_MEMBER: {
        const _tx = api?.tx.daoCouncilMembers.addMember(daoId, state.target);
        return [daoId, _tx, LENGTH_BOUND];
      }
      case ProposalEnum.PROPOSE_REMOVE_MEMBER: {
        const _tx = api?.tx.daoCouncilMembers.removeMember(daoId, state.target);
        return [daoId, _tx, LENGTH_BOUND];
      }
      case ProposalEnum.PROPOSE_TRANSFER_GOVERNANCE_TOKEN: {
        const _tx = api?.tx.dao.transferToken(
          daoId,
          state.amount,
          state.target
        );
        return [daoId, _tx, LENGTH_BOUND];
      }
      default: {
        // eslint-disable-next-line no-console
        console.error('No such method exists');
        return [];
      }
    }
  }, [
    api?.tx.dao,
    api?.tx.daoCouncilMembers,
    daoId,
    members,
    state.amount,
    state.proposalType,
    state.target
  ]);

  const disabled =
    !state.proposalType ||
    (state.proposalType === ProposalEnum.PROPOSE_TRANSFER &&
      (!state.amount || !state.target)) ||
    ((state.proposalType === ProposalEnum.PROPOSE_ADD_MEMBER ||
      state.proposalType === ProposalEnum.PROPOSE_REMOVE_MEMBER) &&
      !state.target);

  const extrinsic = useMemo(() => {
    if (
      !api ||
      state.proposalType !== ProposalEnum.PROPOSE_TRANSFER ||
      !state.amount ||
      !state.target
    ) {
      return null;
    }

    const _tx = api?.tx.daoTreasury.approveProposal(
      daoId,
      nextTreasuryProposalId
    );

    const _proposeSpend = [daoId, parseInt(state.amount, 10), state.target];
    const _approveProposal = [daoId, _tx, LENGTH_BOUND];

    return api.tx.utility.batch([
      api.tx.daoTreasury.proposeSpend(..._proposeSpend),
      api.tx.daoCouncil.propose(..._approveProposal)
    ]);
  }, [
    api,
    daoId,
    nextTreasuryProposalId,
    state.amount,
    state.proposalType,
    state.target
  ]);

  const onSuccess = () => {
    setProposedTreasuryId(nextTreasuryProposalId);
    proposalCreatedHandler();
  };

  let _accounts: KeyringPair[] | undefined;

  switch (state.proposalType) {
    case ProposalEnum.PROPOSE_ADD_MEMBER: {
      _accounts = accounts?.filter(
        (_account) =>
          !members?.find((_member) => _member.address === _account.address)
      );
      break;
    }
    case ProposalEnum.PROPOSE_REMOVE_MEMBER: {
      _accounts = accounts?.filter((_account) =>
        members?.find((_member) => _member.address === _account.address)
      );
      break;
    }
    default: {
      _accounts = accounts;
    }
  }

  const handleProposeClick = async () => {
    if (!metamaskAccount || !keyring) {
      return;
    }

    try {
      switch (state.proposalType) {
        case ProposalEnum.PROPOSE_TRANSFER: {
          await daoTreasuryContract
            ?.connect(metamaskAccount)
            .proposeSpend(
              parseInt(daoId, 10),
              parseInt(state.amount, 10),
              isEthereumAddress(state.target)
                ? state.target
                : u8aToHex(addressToEvm(state.target))
            );
          setProposedTreasuryId(nextTreasuryProposalId);
          break;
        }
        case ProposalEnum.PROPOSE_TRANSFER_GOVERNANCE_TOKEN: {
          const _tx = api?.tx.dao.transferToken(
            parseInt(daoId, 10),
            parseInt(state.amount, 10),
            isEthereumAddress(state.target)
              ? evmToAddress(state.target)
              : state.target
          );
          const proposalCallData = _tx?.method.toHex();
          await daoCollectiveContract
            ?.connect(metamaskAccount)
            .propose(daoId, proposalCallData);
          proposalCreatedHandler();
          break;
        }
        case ProposalEnum.PROPOSE_ADD_MEMBER: {
          const _tx = api?.tx.daoCouncilMembers.addMember(
            daoId,
            isEthereumAddress(state.target)
              ? evmToAddress(state.target)
              : state.target
          );
          const proposalCallData = _tx?.method.toHex();
          await daoCollectiveContract
            ?.connect(metamaskAccount)
            .propose(daoId, proposalCallData);
          proposalCreatedHandler();
          break;
        }
        case ProposalEnum.PROPOSE_REMOVE_MEMBER: {
          const _tx = api?.tx.daoCouncilMembers.removeMember(
            daoId,
            isEthereumAddress(state.target)
              ? evmToAddress(state.target)
              : state.target
          );
          const proposalCallData = _tx?.method.toHex();
          await daoCollectiveContract
            ?.connect(metamaskAccount)
            .propose(daoId, proposalCallData);
          proposalCreatedHandler();
          break;
        }
        default: {
          // eslint-disable-next-line no-console
          console.error('No such case');
        }
      }
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
    <div className={styles.container}>
      <div className={styles.content}>
        <Card className={styles['proposal-title-card']}>
          <Typography variant="title4">Create Proposal</Typography>
        </Card>
        <Card className={styles['proposal-input-card']}>
          <div className={styles['proposal-type-container']}>
            <Icon name={icon} className={styles.icon} />
            <Dropdown
              dropdownItems={
                <Card dropdown className={styles['proposal-dropdown-card']}>
                  <RadioGroup
                    value={state.proposalType}
                    className={styles['proposal-dropdown-radio-group']}
                    onChange={onInputChange}
                    name={InputName.PROPOSAL_TYPE}
                  >
                    {Object.values(ProposalEnum).map((x) => (
                      <div
                        key={x}
                        className={styles['proposal-dropdown-content-span']}
                      >
                        <Radio label={x} value={x} />
                      </div>
                    ))}
                  </RadioGroup>
                </Card>
              }
            >
              <Button
                variant="text"
                className={styles['proposal-type-button']}
                size="sm"
              >
                <div className={styles['proposal-type-dropdown']}>
                  <Typography variant="title2">
                    {state.proposalType
                      ? state.proposalType
                      : InputLabel.PROPOSAL_TYPE}
                  </Typography>
                  <Icon name="arrow-down" size="sm" />
                </div>
              </Button>
            </Dropdown>
          </div>
          {state.proposalType && (
            <div className={styles['proposal-input-container']}>
              {(state.proposalType === ProposalEnum.PROPOSE_TRANSFER ||
                state.proposalType ===
                  ProposalEnum.PROPOSE_TRANSFER_GOVERNANCE_TOKEN) && (
                <div className={styles['proposal-input-transfer']}>
                  <Input
                    name={InputName.AMOUNT}
                    label={InputLabel.AMOUNT}
                    value={state.amount}
                    onChange={onInputChange}
                    type="tel"
                    required
                  />

                  <MembersDropdown
                    accounts={_accounts}
                    handleOnClick={handleOnClick}
                    handleOnKeyDown={handleOnKeyDown}
                  >
                    <Input
                      onChange={onInputChange}
                      name={InputName.TARGET}
                      label={InputLabel.TARGET}
                      value={
                        (accounts?.find(
                          (_account) => _account.address === state.target
                        )?.meta.name as string) ?? state.target
                      }
                      required
                    />
                  </MembersDropdown>
                </div>
              )}
              {(state.proposalType === ProposalEnum.PROPOSE_ADD_MEMBER ||
                state.proposalType === ProposalEnum.PROPOSE_REMOVE_MEMBER) && (
                <div className={styles['proposal-input-member']}>
                  <MembersDropdown
                    accounts={_accounts}
                    handleOnClick={handleOnClick}
                    handleOnKeyDown={handleOnKeyDown}
                  >
                    <Input
                      onChange={onInputChange}
                      name={InputName.TARGET}
                      label={InputLabel.MEMBER}
                      value={
                        (accounts?.find(
                          (_account) => _account.address === state.target
                        )?.meta.name as string) ?? state.target
                      }
                      required
                    />
                  </MembersDropdown>
                </div>
              )}
            </div>
          )}
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
                Propose
              </Button>
            ) : (
              <TxButton
                extrinsic={extrinsic}
                accountId={substrateAccount?.address}
                params={handleTransform}
                disabled={disabled}
                tx={api?.tx.daoCouncil.propose}
                onSuccess={onSuccess}
              >
                Propose
              </TxButton>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
