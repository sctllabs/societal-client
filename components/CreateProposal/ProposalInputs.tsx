import {
  ChangeEventHandler,
  Dispatch,
  KeyboardEventHandler,
  MouseEventHandler,
  SetStateAction,
  useCallback
} from 'react';

import { useAtomValue } from 'jotai';
import { accountsAtom } from 'store/account';

import type { KeyringPair } from '@polkadot/keyring/types';

import { Input } from 'components/ui-kit/Input';
import { Typography } from 'components/ui-kit/Typography';
import { MembersDropdown } from 'components/MembersDropdown';

import styles from './CreateProposal.module.scss';
import {
  InputLabel,
  InputName,
  ProposalEnum,
  ProposalVotingAccessEnum,
  State
} from './types';

const MAX_INPUT_LENGTH = 500;

type ProposalInputsProps = {
  proposalType: ProposalEnum | null;
  state: State;
  setState: Dispatch<SetStateAction<State>>;
  members: KeyringPair[];
  proposalVotingAccess: ProposalVotingAccessEnum | null;
};

export function ProposalInputs({
  state,
  setState,
  members,
  proposalType,
  proposalVotingAccess
}: ProposalInputsProps) {
  const accounts = useAtomValue(accountsAtom);

  let _accounts: KeyringPair[] | undefined;

  switch (proposalType) {
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

  const handleMemberChoose = useCallback(
    (target: HTMLUListElement) => {
      const selectedWalletAddress = target.getAttribute('data-address');
      if (!selectedWalletAddress) {
        return;
      }
      setState((prevState) => ({
        ...prevState,
        target: selectedWalletAddress
      }));
    },
    [setState]
  );

  const handleOnClick: MouseEventHandler<HTMLUListElement> = useCallback(
    (e) => handleMemberChoose(e.target as HTMLUListElement),
    [handleMemberChoose]
  );

  const handleOnKeyDown: KeyboardEventHandler<HTMLUListElement> = useCallback(
    (e) => {
      if (e.key !== ' ' && e.key !== 'Enter') {
        return;
      }

      handleMemberChoose(e.target as HTMLUListElement);
    },
    [handleMemberChoose]
  );

  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name;
    const targetValue = target.value;

    setState((prevState) => ({
      ...prevState,
      [targetName]:
        targetName === InputName.AMOUNT
          ? targetValue.replace(/[^0-9]/g, '')
          : targetValue
    }));
  };

  return (
    <div className={styles['proposal-input-container']}>
      <Input
        name={InputName.TITLE}
        label={InputLabel.TITLE}
        value={state.title}
        onChange={onInputChange}
        maxLength={MAX_INPUT_LENGTH}
        hint={
          <Typography variant="caption3">{state.title.length}/500</Typography>
        }
        required
      />

      <Input
        name={InputName.DESCRIPTION}
        label={InputLabel.DESCRIPTION}
        value={state.description}
        onChange={onInputChange}
        maxLength={MAX_INPUT_LENGTH}
        hint={
          <Typography variant="caption3">
            {state.description.length}/500
          </Typography>
        }
        required
      />
      {(proposalType === ProposalEnum.PROPOSE_TRANSFER ||
        proposalType === ProposalEnum.PROPOSE_TRANSFER_GOVERNANCE_TOKEN) && (
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
                (accounts?.find((_account) => _account.address === state.target)
                  ?.meta.name as string) ?? state.target
              }
              required
            />
          </MembersDropdown>
        </div>
      )}
      {(proposalType === ProposalEnum.PROPOSE_ADD_MEMBER ||
        proposalType === ProposalEnum.PROPOSE_REMOVE_MEMBER) && (
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
                (accounts?.find((_account) => _account.address === state.target)
                  ?.meta.name as string) ?? state.target
              }
              required
            />
          </MembersDropdown>
        </div>
      )}
      {proposalVotingAccess === ProposalVotingAccessEnum.Democracy && (
        <div className={styles.balance}>
          <Input
            name={InputName.LOCKED_BALANCE}
            label={InputLabel.LOCKED_BALANCE}
            value={state.balance}
            onChange={onInputChange}
            type="tel"
            required
          />
        </div>
      )}
    </div>
  );
}
