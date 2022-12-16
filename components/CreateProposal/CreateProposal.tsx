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

import { Card } from 'components/ui-kit/Card';
import { Icon } from 'components/ui-kit/Icon';
import { RadioGroup } from 'components/ui-kit/Radio/RadioGroup';
import { Button } from 'components/ui-kit/Button';
import { Dropdown } from 'components/ui-kit/Dropdown';
import { Radio } from 'components/ui-kit/Radio/Radio';
import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';
import { TxButton } from 'components/TxButton';

import type { MemberMeta } from 'types';

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
  MEMBER = 'member',
  PROPOSAL_ID = 'proposalId',
  PROPOSAL_THRESHOLD = 'proposalThreshold'
}

enum InputLabel {
  PROPOSAL_TYPE = 'Choose Proposal Type',
  DESCRIPTION = 'Description',
  AMOUNT = 'Amount',
  TARGET = 'Target',
  MEMBER = 'Choose a member',
  PROPOSAL_ID = 'Proposal ID',
  PROPOSAL_THRESHOLD = 'Proposal Threshold'
}

type State = {
  proposalType: string;
  description: string;
  amount: string;
  target: string;
  member: string;
  proposalThreshold: string;
  proposalId: string;
};

export enum ProposalEnum {
  PROPOSE_TRANSFER = 'Propose Transfer',
  PROPOSE_ADD_MEMBER = 'Propose Add Member',
  PROPOSE_REMOVE_MEMBER = 'Propose Remove Member',
  APPROVE_PROPOSAL = 'Approve Proposal'
}

const LENGTH_BOUND = 100000;

export function CreateProposal({ daoId }: CreateProposalProps) {
  const currentAccount = useAtomValue(currentAccountAtom);
  const router = useRouter();
  const [members, setMembers] = useState<MemberMeta[]>([]);
  const api = useAtomValue(apiAtom);
  const keyring = useAtomValue(keyringAtom);

  const [state, setState] = useState<State>({
    proposalType: '',
    description: '',
    amount: '',
    target: '',
    member: '',
    proposalId: '',
    proposalThreshold: ''
  });

  useEffect(() => {
    if (!api || !keyring) {
      return undefined;
    }

    let unsubscribe: any | null = null;
    const accounts = keyring.getPairs();

    api.query.daoCouncil
      .members(daoId)
      .then((x) => {
        const addresses = x.toHuman() as string[];
        setMembers(
          addresses.map((address) => ({
            address,
            name:
              (accounts.find((account) => account.address === address)?.meta
                ?.name as string) || ''
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

  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name;
    const targetValue = target.value;

    setState((prevState) => ({
      ...prevState,
      [targetName]:
        targetName === InputName.AMOUNT ||
        targetName === InputName.PROPOSAL_ID ||
        targetName === InputName.PROPOSAL_THRESHOLD
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
    if (!api) {
      return [];
    }

    switch (state.proposalType) {
      case ProposalEnum.PROPOSE_TRANSFER: {
        return [daoId, parseInt(state.amount, 10), state.target];
      }
      case ProposalEnum.PROPOSE_ADD_MEMBER: {
        const _tx = api.tx.daoCouncilMemberships.addMember(daoId, state.member);
        return [daoId, members.length - 1, _tx, LENGTH_BOUND];
      }
      case ProposalEnum.PROPOSE_REMOVE_MEMBER: {
        const _tx = api.tx.daoCouncilMemberships.removeMember(
          daoId,
          state.member
        );
        return [daoId, members.length - 1, _tx, LENGTH_BOUND];
      }
      case ProposalEnum.APPROVE_PROPOSAL: {
        const _tx = api.tx.daoTreasury.approveProposal(daoId, state.proposalId);
        return [
          daoId,
          parseInt(state.proposalThreshold, 10),
          _tx,
          LENGTH_BOUND
        ];
      }
      default: {
        // eslint-disable-next-line no-console
        console.error('No such method exists');
        return [];
      }
    }
  }, [
    api,
    daoId,
    members.length,
    state.amount,
    state.member,
    state.proposalId,
    state.proposalThreshold,
    state.proposalType,
    state.target
  ]);

  const palletRPC =
    state.proposalType === ProposalEnum.PROPOSE_TRANSFER
      ? 'daoTreasury'
      : 'daoCouncil';
  const callable =
    state.proposalType === ProposalEnum.PROPOSE_TRANSFER
      ? 'proposeSpend'
      : 'propose';

  const isDisabled =
    !state.proposalType ||
    !state.description ||
    (state.proposalType === ProposalEnum.PROPOSE_TRANSFER &&
      (!state.amount || !state.target)) ||
    ((state.proposalType === ProposalEnum.PROPOSE_ADD_MEMBER ||
      state.proposalType === ProposalEnum.PROPOSE_REMOVE_MEMBER) &&
      !state.member);

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
              {state.proposalType === ProposalEnum.APPROVE_PROPOSAL && (
                <div className={styles['proposal-input-transfer']}>
                  <Input
                    name={InputName.PROPOSAL_ID}
                    label={InputLabel.PROPOSAL_ID}
                    value={state.proposalId}
                    onChange={onInputChange}
                    type="tel"
                    required
                  />
                  <Input
                    name={InputName.PROPOSAL_THRESHOLD}
                    label={InputLabel.PROPOSAL_THRESHOLD}
                    value={state.proposalThreshold}
                    onChange={onInputChange}
                    type="tel"
                    required
                  />
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
              accountId={currentAccount?.address}
              params={handleTransform}
              isDisabled={isDisabled}
              tx={api?.tx[palletRPC][callable]}
            >
              Propose
            </TxButton>
          </div>
        </Card>
      </div>
    </div>
  );
}
