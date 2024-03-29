import {
  ChangeEventHandler,
  Dispatch,
  SetStateAction,
  Fragment,
  useEffect
} from 'react';
import { format } from 'date-fns';

import { useAtomValue } from 'jotai';
import { accountsAtom } from 'store/account';
import { currentDaoAtom } from 'store/dao';
import { tokenDecimalsAtom, tokenSymbolAtom } from 'store/token';
import { chainDecimalsAtom, chainSymbolAtom } from 'store/api';
import { bountiesAtom } from 'store/bounty';

import type { KeyringPair } from '@polkadot/keyring/types';
import { formatBalance } from '@polkadot/util';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue
} from 'components/ui-kit/Select';
import { Input } from 'components/ui-kit/Input';
import { Typography } from 'components/ui-kit/Typography';
import { MembersDropdown } from 'components/MembersDropdown';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from 'components/ui-kit/Tooltip';
import { Icon } from 'components/ui-kit/Icon';

import {
  BountyProposalEnum,
  Currency,
  InputLabel,
  InputName,
  ProposalEnum,
  ProposalVotingAccessEnum,
  State
} from './types';
import styles from './CreateProposal.module.scss';

type ProposalInputsProps = {
  proposalType: ProposalEnum | BountyProposalEnum | undefined;
  state: State;
  setState: Dispatch<SetStateAction<State>>;
  setCurrency: Dispatch<SetStateAction<Currency | null>>;
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
  const chainDecimals = useAtomValue(chainDecimalsAtom);
  const tokenDecimals = useAtomValue(tokenDecimalsAtom);

  let _accounts: KeyringPair[] | undefined;

  const validate = (target: any) => {
    let errors: { member: string } | null = null;
    switch (proposalType) {
      case ProposalEnum.ADD_MEMBER: {
        if (currentDao?.council.includes(target)) {
          errors = { member: 'Already a Member' };
        }

        break;
      }
      case ProposalEnum.REMOVE_MEMBER: {
        if (!currentDao?.council.includes(target)) {
          errors = { member: 'Not a Member' };
        }

        break;
      }
      default: {
        break;
      }
    }

    return errors;
  };

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
      target,
      errors: validate(target)
    }));
  };

  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;

    let { errors } = state;
    if (name === InputName.TARGET) {
      errors = validate(value);
    }

    setState((prevState) => ({
      ...prevState,
      [name]: name === InputName.AMOUNT ? value.replace(/[^0-9]/g, '') : value,
      errors
    }));
  };

  const onCurrencyValueChange = (currency: Currency) => setCurrency(currency);
  const onBountyValueChange = (bountyIndex: string) =>
    setState((prevState) => ({ ...prevState, bountyIndex }));

  const selectedBounty = bounties?.find(
    ({ index }) =>
      index ===
      // eslint-disable-next-line no-restricted-globals
      (!isNaN(state.bountyIndex as any)
        ? parseInt(state.bountyIndex as any, 10)
        : -1)
  );

  useEffect(() => {
    if (!chainSymbol) {
      return;
    }

    let currency: Currency = { currency: chainSymbol, type: 'Native' };
    if (selectedBounty && !selectedBounty.nativeToken && tokenSymbol) {
      currency = { currency: tokenSymbol, type: 'Governance Token' };
    }

    setCurrency(currency);
  }, [selectedBounty, chainSymbol, tokenSymbol, setCurrency]);

  return (
    <>
      {(proposalType === BountyProposalEnum.BOUNTY_CURATOR ||
        proposalType === BountyProposalEnum.BOUNTY_UNASSIGN_CURATOR) && (
        <div className={styles['proposal-input-transfer']}>
          {proposalType === BountyProposalEnum.BOUNTY_CURATOR && (
            <MembersDropdown
              accounts={_accounts}
              onValueChange={onAccountValueChange}
            >
              <Input
                onChange={onInputChange}
                name={InputName.TARGET}
                label={InputLabel.CURATOR}
                value={
                  (accounts?.find(
                    (_account) => _account.address === state.target
                  )?.meta.name as string) ?? state.target
                }
                required
              />
            </MembersDropdown>
          )}

          <Select
            defaultValue={state.bountyIndex}
            onValueChange={onBountyValueChange}
          >
            <SelectTrigger disabled={!bounties?.length}>
              <SelectValue placeholder={InputLabel.BOUNTY_INDEX}>
                <Typography variant="title5">
                  Bounty Index - {state.bountyIndex}
                </Typography>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {bounties?.map((bounty, index) => {
                const { title, description } = bounty.description
                  ? JSON.parse(bounty.description)
                  : { title: '', description: '' };
                const date = format(new Date(bounty.createdAt), 'dd MMMM yyyy');

                return (
                  <Fragment key={bounty.id}>
                    <SelectItem
                      className={styles['select-bounty-item']}
                      value={bounty.index.toString()}
                    >
                      <div className={styles['select-bounty-container']}>
                        <span>
                          <Typography variant="title5">{title}</Typography>
                          <Typography variant="body2">{description}</Typography>
                        </span>
                        <div className={styles['select-bounty-items']}>
                          <span className={styles['bounty-item']}>
                            <Typography variant="caption2">
                              Bounty Index
                            </Typography>
                            <Typography variant="title5">
                              {bounty.index}
                            </Typography>
                          </span>
                          <span className={styles['bounty-item']}>
                            <Typography variant="caption2">Amount</Typography>
                            <Typography variant="title5">
                              {formatBalance(bounty.value, {
                                decimals:
                                  (bounty.nativeToken
                                    ? chainDecimals
                                    : tokenDecimals) || 0,
                                withSi: false,
                                forceUnit: '-'
                              })}{' '}
                              {bounty.nativeToken ? chainSymbol : tokenSymbol}
                            </Typography>
                          </span>
                          <span className={styles['bounty-item']}>
                            <Typography variant="caption2">Approved</Typography>
                            <Typography variant="title5">{date}</Typography>
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                    {bounties && index !== bounties.length - 1 && (
                      <SelectSeparator />
                    )}
                  </Fragment>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}
      {(proposalType === BountyProposalEnum.BOUNTY ||
        proposalType === BountyProposalEnum.BOUNTY_CURATOR) &&
        chainSymbol && (
          <div className={styles['proposal-input-bounty-amount']}>
            <Input
              name={InputName.AMOUNT}
              label={
                proposalType === BountyProposalEnum.BOUNTY
                  ? InputLabel.AMOUNT
                  : InputLabel.FEE
              }
              value={state.amount}
              onChange={onInputChange}
              type="tel"
              required
              endAdornment={
                (proposalType === BountyProposalEnum.BOUNTY &&
                  (currentDao?.fungibleToken?.id && tokenSymbol ? (
                    <Select
                      defaultValue={`${chainSymbol}-${'native'}`}
                      onValueChange={(value) => {
                        const isNative = !value.includes('gov');
                        const currency: Currency = {
                          currency: isNative ? chainSymbol : tokenSymbol,
                          type: isNative ? 'Native' : 'Governance Token'
                        };

                        onCurrencyValueChange(currency);
                      }}
                    >
                      <SelectTrigger datatype="input">
                        <SelectValue
                          defaultValue={`${chainSymbol}-${'native'}`}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={`${chainSymbol}-${'native'}`}>
                          <Typography variant="body2">{chainSymbol}</Typography>
                        </SelectItem>
                        <SelectItem value={`${tokenSymbol}-${'gov'}`}>
                          <Typography variant="body2">{tokenSymbol}</Typography>
                          {chainSymbol === tokenSymbol && (
                            <Typography variant="caption4">
                              governance
                            </Typography>
                          )}
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
                  ))) ||
                (proposalType === BountyProposalEnum.BOUNTY_CURATOR && (
                  <>
                    <div style={{ textAlign: 'center' }}>
                      <Typography
                        className={styles['select-currency']}
                        variant="body2"
                      >
                        {selectedBounty &&
                          (selectedBounty.nativeToken
                            ? chainSymbol
                            : tokenSymbol)}
                      </Typography>
                      {chainSymbol === tokenSymbol &&
                      selectedBounty &&
                      !selectedBounty.nativeToken ? (
                        <Typography variant="caption4">governance</Typography>
                      ) : null}
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Icon
                              className={styles['hint-logo-icon']}
                              name="noti-info-stroke"
                              size="xs"
                            />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          The reserved upfront payment for a curator for work
                          related to the bounty. <br />
                          Should be less than bounty amount.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                ))
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
            type="number"
            step="any"
            required
            endAdornment={
              <Typography className={styles['select-currency']} variant="body2">
                {proposalType === ProposalEnum.TRANSFER && chainSymbol}
                {proposalType === ProposalEnum.TRANSFER_GOVERNANCE_TOKEN &&
                  tokenSymbol}
              </Typography>
            }
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
              error={state.errors}
              onChange={onInputChange}
              name={InputName.TARGET}
              label={InputLabel.MEMBER}
              value={
                (accounts?.find((_account) => _account.address === state.target)
                  ?.meta.name as string) ?? state.target
              }
              hint={
                state.errors &&
                state.errors.member && (
                  <Typography variant="caption3">
                    {state.errors.member}
                  </Typography>
                )
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
            endAdornment={
              <span>
                <Typography
                  className={styles['select-currency']}
                  variant="body2"
                >
                  {tokenSymbol}
                </Typography>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Icon
                          className={styles['hint-logo-icon']}
                          name="noti-info-stroke"
                          size="xs"
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Minimum Deposit is{' '}
                      {currentDao?.policy?.governance?.__typename ===
                        'GovernanceV1' &&
                        currentDao?.policy?.governance?.minimumDeposit}{' '}
                      {tokenSymbol}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            }
          />
        </div>
      )}
    </>
  );
}
