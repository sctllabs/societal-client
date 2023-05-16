import { useMemo } from 'react';
import clsx from 'clsx';

import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { tokenDecimalsAtom, tokenSymbolAtom } from 'store/token';
import { accountsAtom } from 'store/account';
import { apiAtom, chainDecimalsAtom, chainSymbolAtom } from 'store/api';

import { getProposalSettings } from 'utils/getProposalSettings';
import { maskAddress } from 'utils/maskAddress';
import { parseMeta } from 'utils/parseMeta';
import { extractErrorFromString } from 'utils/errors';
import { formatBalance } from '@polkadot/util';
import type {
  AddMemberProposal,
  CouncilProposalMeta,
  DemocracyProposalMeta,
  EthGovernanceProposalMeta,
  ProposeCuratorProposal,
  RemoveMemberProposal,
  SpendProposal,
  TransferProposal
} from 'types';

import { Card } from 'components/ui-kit/Card';
import { Icon } from 'components/ui-kit/Icon';
import { Typography } from 'components/ui-kit/Typography';
import { Chip } from 'components/ui-kit/Chip';
import { Countdown } from 'components/Countdown';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from 'components/ui-kit/Tooltip';

import styles from './TaskCard.module.scss';

export interface TaskCardProps {
  proposal:
    | CouncilProposalMeta
    | DemocracyProposalMeta
    | EthGovernanceProposalMeta;
  currentBlock: number | null;
}

type TaskStatus =
  | 'Pending'
  | 'Active'
  | 'Completed'
  | 'Expired'
  | 'Referendum'
  | 'Failed';

export function TaskCard({ proposal, currentBlock }: TaskCardProps) {
  const taskStatus: TaskStatus = useMemo(() => {
    switch (proposal.status) {
      case 'Open': {
        return 'Active';
      }
      case 'Referendum': {
        return 'Completed';
      }
      case 'Expired': {
        return 'Expired';
      }
      case 'Executed': {
        return proposal.executed ? 'Completed' : 'Failed';
      }
      case 'Pending':
        return 'Pending';
      default: {
        return 'Completed';
      }
    }
  }, [proposal]);

  const api = useAtomValue(apiAtom);
  const currentDao = useAtomValue(currentDaoAtom);
  const tokenSymbol = useAtomValue(tokenSymbolAtom);
  const tokenDecimals = useAtomValue(tokenDecimalsAtom);
  const chainSymbol = useAtomValue(chainSymbolAtom);
  const chainDecimals = useAtomValue(chainDecimalsAtom);
  const accounts = useAtomValue(accountsAtom);

  const { proposalTitle, icon } = getProposalSettings(proposal.kind);

  const meta = parseMeta(proposal.meta);
  const title = meta?.title;
  const description = meta?.description;

  const proposalLabel = useMemo(() => {
    switch (proposal.__typename) {
      case 'DemocracyProposal':
        return 'Democracy Proposal';
      case 'EthGovernanceProposal':
        return 'Ownership Weighted';
      default:
        return 'Council';
    }
  }, [proposal.__typename]);

  const currency = useMemo(() => {
    switch (proposal.kind.__typename) {
      case 'CreateBounty': {
        return chainSymbol;
      }
      case 'CreateTokenBounty': {
        return tokenSymbol;
      }
      case 'Spend': {
        return chainSymbol;
      }
      case 'TransferToken': {
        return tokenSymbol;
      }
      case 'MintDaoToken': {
        return tokenSymbol;
      }
      default: {
        return null;
      }
    }
  }, [proposal.kind.__typename, chainSymbol, tokenSymbol]);

  const decimals = useMemo(() => {
    switch (proposal.kind.__typename) {
      case 'CreateBounty': {
        return chainDecimals;
      }
      case 'CreateTokenBounty': {
        return tokenDecimals;
      }
      case 'Spend': {
        return chainDecimals;
      }
      case 'TransferToken': {
        return tokenDecimals;
      }
      case 'MintDaoToken': {
        return tokenDecimals;
      }
      default: {
        return null;
      }
    }
  }, [proposal.kind.__typename, chainDecimals, tokenDecimals]);

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles['status-container']}>
          <Icon
            name="circle"
            className={clsx(
              styles['status-icon'],
              styles[`icon-${taskStatus.toLowerCase()}`]
            )}
          />
          <Typography variant="title7">{taskStatus}</Typography>
          {(proposal.__typename === 'CouncilProposal' ||
            proposal.__typename === 'EthGovernanceProposal') &&
          taskStatus === 'Failed' ? (
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
                  {extractErrorFromString(api, proposal.reason)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </div>
        {proposal.status === 'Open' && currentDao && currentBlock && (
          <Countdown
            endBlock={
              proposal.blockNum +
              currentDao.policy.proposalPeriod -
              currentBlock
            }
            orientation="horizontal"
            typography="value5"
          />
        )}
        {proposal.status === 'Pending' && (
          <span className={styles['pending-status']}>
            <Typography variant="value5">
              Proposal is being processed
            </Typography>
            <Typography variant="caption2">Please wait</Typography>
          </span>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles['description-container']}>
          <div className={styles['title-container']}>
            <Icon name={icon} className={styles['proposal-icon']} />
            <div className={styles.title}>
              <Typography variant="title4">{proposalTitle}</Typography>
              <span>
                <Chip
                  variant="proposal"
                  color={
                    proposal.__typename === 'DemocracyProposal'
                      ? 'dark-green'
                      : 'dark-blue'
                  }
                >
                  <Typography variant="title6">{proposalLabel}</Typography>
                </Chip>
              </span>
            </div>
          </div>
          {title && <Typography variant="title5">{title}</Typography>}
          {description && (
            <Typography variant="body2">{description}</Typography>
          )}

          <div className={styles['proposal-bottom-container']}>
            <span className={styles['proposal-item-info']}>
              <Typography variant="caption2">Proposer&nbsp;</Typography>
              <span className={styles['proposal-item']}>
                <Icon name="user-profile" size="xs" />
                <Typography variant="title5">
                  {maskAddress(
                    (accounts?.find(
                      (_account) => _account.address === proposal.account.id
                    )?.meta.name as string) ?? proposal.account.id
                  )}
                </Typography>
              </span>
            </span>

            {(proposal.kind.__typename === 'TransferToken' ||
              proposal.kind.__typename === 'Spend') && (
              <>
                <span className={styles['proposal-item-info']}>
                  <Typography variant="caption3">Amount</Typography>
                  <span className={styles['proposal-item']}>
                    <Icon name="treasury" size="xs" />
                    <Typography variant="title5">
                      {/* TODO */}
                      {!Number.isNaN(proposal.kind.amount)
                        ? formatBalance(
                            proposal.kind.amount.replaceAll(',', ''),
                            {
                              decimals: decimals || 0,
                              withSi: false,
                              forceUnit: '-'
                            }
                          )
                        : ''}
                    </Typography>
                    <Typography variant="body2">{currency}</Typography>
                  </span>
                </span>
                <span className={styles['proposal-item-info']}>
                  <Typography variant="caption2">Target</Typography>
                  <span className={styles['proposal-item']}>
                    <Icon name="user-profile" size="xs" />
                    <Typography variant="title5">
                      {maskAddress(
                        (accounts?.find(
                          (_account) =>
                            _account.address ===
                            (proposal.kind as TransferProposal | SpendProposal)
                              .beneficiary
                        )?.meta.name as string) ?? proposal.kind.beneficiary
                      )}
                    </Typography>
                  </span>
                </span>
              </>
            )}
            {(proposal.kind.__typename === 'AddMember' ||
              proposal.kind.__typename === 'RemoveMember') && (
              <span className={styles['proposal-item-info']}>
                <Typography variant="caption2">Member</Typography>
                <span className={styles['proposal-item']}>
                  <Icon name="user-profile" size="xs" />
                  <Typography variant="title5">
                    {maskAddress(
                      (accounts?.find(
                        (_account) =>
                          _account.address ===
                          (
                            proposal.kind as
                              | AddMemberProposal
                              | RemoveMemberProposal
                          ).who
                      )?.meta.name as string) ?? proposal.kind.who
                    )}
                  </Typography>
                </span>
              </span>
            )}
            {(proposal.kind.__typename === 'CreateBounty' ||
              proposal.kind.__typename === 'CreateTokenBounty') && (
              <span className={styles['proposal-item-info']}>
                <Typography variant="caption3">Value</Typography>
                <span className={styles['proposal-item']}>
                  <Icon name="treasury" size="xs" />
                  <Typography variant="title5">
                    {/* TODO */}
                    {!Number.isNaN(proposal.kind.value)
                      ? formatBalance(proposal.kind.value.replaceAll(',', ''), {
                          decimals: decimals || 0,
                          withSi: false,
                          forceUnit: '-'
                        })
                      : 0}
                  </Typography>
                  <Typography variant="body2">
                    {proposal.kind.__typename === 'CreateBounty'
                      ? chainSymbol
                      : tokenSymbol}
                  </Typography>
                </span>
              </span>
            )}
            {proposal.kind.__typename === 'ProposeCurator' && (
              <span className={styles['proposal-item-info']}>
                <Typography variant="caption2">Curator</Typography>
                <span className={styles['proposal-item']}>
                  <Icon name="user-profile" size="xs" />
                  <Typography variant="title5">
                    {maskAddress(
                      (accounts?.find(
                        (_account) =>
                          _account.address ===
                          (proposal.kind as ProposeCuratorProposal).curator
                      )?.meta.name as string) ?? proposal.kind.curator
                    )}
                  </Typography>
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
