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

import { apiAtom, currentAccountAtom, keyringAtom } from 'store/api';
import { useAtomValue } from 'jotai';

import { LENGTH_BOUND } from 'constants/transaction';

import type { MemberMeta } from 'types';
import type { u32, Vec } from '@polkadot/types';
import type { AccountId } from '@polkadot/types/interfaces';

import { Card } from 'components/ui-kit/Card';
import { Icon } from 'components/ui-kit/Icon';
import { RadioGroup } from 'components/ui-kit/Radio/RadioGroup';
import { Button } from 'components/ui-kit/Button';
import { Dropdown } from 'components/ui-kit/Dropdown';
import { Radio } from 'components/ui-kit/Radio/Radio';
import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';
import { TxButton } from 'components/TxButton';

import styles from './CreateProposal.module.scss';

const DESCRIPTION_INPUT_MAX_LENGTH = 500;

export interface CreateProposalProps {
  daoId: string;
}

enum InputName {
  PROPOSAL_TYPE = 'proposalType',
  DESCRIPTION = 'description',
  AMOUNT = 'amount',
  TARGET = 'target',
  MEMBER = 'member'
}

enum InputLabel {
  PROPOSAL_TYPE = 'Choose Proposal Type',
  DESCRIPTION = 'Description',
  AMOUNT = 'Amount',
  TARGET = 'Target',
  MEMBER = 'Choose a member'
}

type State = {
  proposalType: string;
  description: string;
  amount: string;
  target: string;
  member: string;
};

export enum ProposalEnum {
  PROPOSE_TRANSFER = 'Propose Transfer',
  PROPOSE_ADD_MEMBER = 'Propose Add Member',
  PROPOSE_REMOVE_MEMBER = 'Propose Remove Member'
}

export function CreateProposal({ daoId }: CreateProposalProps) {
  const currentAccount = useAtomValue(currentAccountAtom);
  const router = useRouter();
  const [members, setMembers] = useState<MemberMeta[]>([]);
  const api = useAtomValue(apiAtom);
  const keyring = useAtomValue(keyringAtom);

  const [nextProposalId, setNextProposalId] = useState<number | null>(null);

  const [state, setState] = useState<State>({
    proposalType: '',
    description: '',
    amount: '',
    target: '',
    member: ''
  });

  useEffect(() => {
    let unsubscribe: any | null = null;
    const accounts = keyring?.getPairs();

    api?.query.daoCouncil
      .members(daoId, (_members: Vec<AccountId>) => {
        setMembers(
          _members.map((_member) => ({
            address: _member.toString(),
            name:
              accounts
                ?.find((account) => account.address === _member.toString())
                ?.meta?.name?.toString() || ''
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
  }, [api, daoId, keyring]);

  useEffect(() => {
    let unsubscribe: any | null = null;

    api?.query.daoCouncil
      .proposalCount<u32>(daoId, (x: u32) => setNextProposalId(x.toNumber()))
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

  const handleOnClick: MouseEventHandler<HTMLUListElement> = (e) => {
    if (!keyring) {
      return;
    }

    const selectedWalletAddress = (e.target as HTMLElement).getAttribute(
      'data-address'
    );
    if (!selectedWalletAddress) {
      return;
    }
    setState((prevState) => ({
      ...prevState,
      member: keyring.getPair(selectedWalletAddress).address
    }));
  };

  const handleOnKeyDown: KeyboardEventHandler<HTMLUListElement> = (e) => {
    if (!keyring) {
      return;
    }

    if (e.key !== ' ' && e.key !== 'Enter') {
      return;
    }

    const selectedWalletAddress = (e.target as HTMLElement).getAttribute(
      'data-address'
    );
    if (!selectedWalletAddress) {
      return;
    }
    setState((prevState) => ({
      ...prevState,
      member: keyring.getPair(selectedWalletAddress).address
    }));
  };

  const handleTransform = useCallback(() => {
    switch (state.proposalType) {
      case ProposalEnum.PROPOSE_ADD_MEMBER: {
        const _tx = api?.tx.daoCouncilMemberships.addMember(
          daoId,
          state.member
        );
        return [daoId, members.length, _tx, LENGTH_BOUND];
      }
      case ProposalEnum.PROPOSE_REMOVE_MEMBER: {
        const _tx = api?.tx.daoCouncilMemberships.removeMember(
          daoId,
          state.member
        );
        return [daoId, members.length, _tx, LENGTH_BOUND];
      }

      default: {
        // eslint-disable-next-line no-console
        console.error('No such method exists');
        return [];
      }
    }
  }, [api, daoId, members.length, state.member, state.proposalType]);

  const disabled =
    !state.proposalType ||
    !state.description ||
    (state.proposalType === ProposalEnum.PROPOSE_TRANSFER &&
      (!state.amount || !state.target)) ||
    ((state.proposalType === ProposalEnum.PROPOSE_ADD_MEMBER ||
      state.proposalType === ProposalEnum.PROPOSE_REMOVE_MEMBER) &&
      !state.member);

  const extrinsic = useMemo(() => {
    if (
      !api ||
      state.proposalType !== ProposalEnum.PROPOSE_TRANSFER ||
      !state.amount ||
      !state.target
    ) {
      return null;
    }

    const _tx = api?.tx.daoTreasury.approveProposal(daoId, nextProposalId);

    const _proposeTransfer = [daoId, parseInt(state.amount, 10), state.target];
    const _approveProposal = [daoId, members.length, _tx, LENGTH_BOUND];

    return api.tx.utility.batch([
      api.tx.daoTreasury.proposeSpend(..._proposeTransfer),
      api.tx.daoCouncil.propose(..._approveProposal)
    ]);
  }, [
    api,
    daoId,
    members.length,
    nextProposalId,
    state.amount,
    state.proposalType,
    state.target
  ]);

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
              <Input
                name={InputName.DESCRIPTION}
                label={InputLabel.DESCRIPTION}
                value={state.description}
                onChange={onInputChange}
                maxLength={DESCRIPTION_INPUT_MAX_LENGTH}
                hint={
                  <Typography variant="caption3">
                    {state.description.length}/500
                  </Typography>
                }
                hintPosition="end"
                required
              />
              {state.proposalType === ProposalEnum.PROPOSE_TRANSFER && (
                <div className={styles['proposal-input-transfer']}>
                  <Input
                    name={InputName.AMOUNT}
                    label={InputLabel.AMOUNT}
                    value={state.amount}
                    onChange={onInputChange}
                    type="tel"
                    required
                  />

                  <Input
                    name={InputName.TARGET}
                    label={InputLabel.TARGET}
                    value={state.target}
                    onChange={onInputChange}
                    required
                  />
                </div>
              )}
              {(state.proposalType === ProposalEnum.PROPOSE_ADD_MEMBER ||
                state.proposalType === ProposalEnum.PROPOSE_REMOVE_MEMBER) && (
                <div className={styles['proposal-input-member']}>
                  <Dropdown
                    fullWidth
                    dropdownItems={
                      <Card dropdown className={styles['member-dropdown-card']}>
                        <ul
                          className={styles['member-dropdown-ul']}
                          onClick={handleOnClick}
                          onKeyDown={handleOnKeyDown}
                          role="presentation"
                        >
                          {members.map((x) => (
                            <li key={x.address}>
                              <Button
                                variant="text"
                                fullWidth
                                className={styles['member-dropdown-button']}
                                size="sm"
                                data-address={x.address}
                              >
                                <span
                                  className={
                                    styles['member-dropdown-button-span']
                                  }
                                >
                                  <Icon name="user-profile" size="sm" />
                                  <Typography variant="title4">
                                    {x.name}
                                  </Typography>
                                </span>
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    }
                  >
                    <Input
                      name={InputName.MEMBER}
                      label={InputLabel.MEMBER}
                      value={state.member}
                      onChange={onInputChange}
                      required
                    />
                  </Dropdown>
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
            <TxButton
              extrinsic={extrinsic}
              accountId={currentAccount?.address}
              params={handleTransform}
              disabled={disabled}
              tx={api?.tx.daoCouncil.propose}
            >
              Propose
            </TxButton>
          </div>
        </Card>
      </div>
    </div>
  );
}
