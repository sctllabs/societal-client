import { ChangeEventHandler, Dispatch, SetStateAction } from 'react';

import { useAtomValue } from 'jotai';
import { accountsAtom } from 'store/account';
import { currentDaoAtom } from 'store/dao';
import { tokenSymbolAtom } from 'store/token';
import { chainSymbolAtom } from 'store/api';

import type { KeyringPair } from '@polkadot/keyring/types';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from 'components/ui-kit/Select';
import { Input } from 'components/ui-kit/Input';
import { Typography } from 'components/ui-kit/Typography';
import { MembersDropdown } from 'components/MembersDropdown';

import {
  InputLabel,
  InputName,
  ProposalEnum,
  ProposalVotingAccessEnum,
  State
} from './types';
import styles from './CreateProposal.module.scss';
import { bountiesAtom } from '../../store/bounty';

type ProposalInputsProps = {
  proposalType: ProposalEnum | null;
  state: State;
  setState: Dispatch<SetStateAction<State>>;
  setCurrency: Dispatch<SetStateAction<string | null>>;
  members: KeyringPair[];
  proposalVotingAccess: ProposalVotingAccessEnum | null;
};

export function ProposalInputs({
  state,
  setState,
  setCurrency,
  members,
  proposalType,
  proposalVotingAccess
}: ProposalInputsProps) {
  const accounts = useAtomValue(accountsAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const tokenSymbol = useAtomValue(tokenSymbolAtom);
  const chainSymbol = useAtomValue(chainSymbolAtom);
  const bounties = useAtomValue(bountiesAtom);

  let _accounts: KeyringPair[] | undefined;

  switch (proposalType) {
    case ProposalEnum.ADD_MEMBER: {
      _accounts = accounts?.filter(
        (_account) =>
          !members?.find((_member) => _member.address === _account.address)
      );
      break;
    }
    case ProposalEnum.REMOVE_MEMBER: {
      _accounts = accounts?.filter((_account) =>
        members?.find((_member) => _member.address === _account.address)
      );
      break;
    }
    default: {
      _accounts = accounts;
    }
  }

  const onAccountValueChange = (target: string) => {
    setState((prevState) => ({
      ...prevState,
      target
    }));
  };

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

  const onCurrencyValueChange = (currency: string) => setCurrency(currency);

  const onBountyValueChange = (bountyIndex: string) =>
    setState((prevState) => ({ ...prevState, bountyIndex }));

  return (
    <>
      {proposalType === ProposalEnum.BOUNTY_CURATOR && (
        <div className={styles['proposal-input-transfer']}>
          <MembersDropdown
            accounts={_accounts}
            onValueChange={onAccountValueChange}
          >
            <Input
              onChange={onInputChange}
              name={InputName.TARGET}
              label={InputLabel.CURATOR}
              value={
                (accounts?.find((_account) => _account.address === state.target)
                  ?.meta.name as string) ?? state.target
              }
              required
            />
          </MembersDropdown>

          <Select onValueChange={onBountyValueChange}>
            <SelectTrigger>
              <SelectValue placeholder={InputLabel.BOUNTY_INDEX} />
            </SelectTrigger>
            <SelectContent>
              {bounties?.map((bounty) => (
                <SelectItem key={bounty.id} value={bounty.index.toString()}>
                  <Typography variant="body2">{bounty.index}</Typography>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {(proposalType === ProposalEnum.BOUNTY ||
        proposalType === ProposalEnum.BOUNTY_CURATOR) &&
        chainSymbol && (
          <div className={styles['proposal-input-bounty-amount']}>
            <Input
              name={InputName.AMOUNT}
              label={
                proposalType === ProposalEnum.BOUNTY
                  ? InputLabel.AMOUNT
                  : InputLabel.FEE
              }
              value={state.amount}
              onChange={onInputChange}
              type="tel"
              required
              endAdornment={
                currentDao?.fungibleToken?.id && tokenSymbol ? (
                  <Select
                    defaultValue={chainSymbol}
                    onValueChange={onCurrencyValueChange}
                  >
                    <SelectTrigger datatype="input">
                      <SelectValue defaultValue={chainSymbol} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={chainSymbol}>
                        <Typography variant="body2">{chainSymbol}</Typography>
                      </SelectItem>
                      <SelectItem value={tokenSymbol}>
                        <Typography variant="body2">{tokenSymbol}</Typography>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Typography
                    className={styles['select-currency']}
                    variant="body2"
                  >
                    {chainSymbol}
                  </Typography>
                )
              }
            />
          </div>
        )}
      {(proposalType === ProposalEnum.TRANSFER ||
        proposalType === ProposalEnum.TRANSFER_GOVERNANCE_TOKEN) && (
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
            onValueChange={onAccountValueChange}
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
      {(proposalType === ProposalEnum.ADD_MEMBER ||
        proposalType === ProposalEnum.REMOVE_MEMBER) && (
        <div className={styles['proposal-input-member']}>
          <MembersDropdown
            accounts={_accounts}
            onValueChange={onAccountValueChange}
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
            name={InputName.DEPOSIT}
            label={InputLabel.DEPOSIT}
            value={state.balance}
            onChange={onInputChange}
            type="tel"
            required
          />
        </div>
      )}
    </>
  );
}
