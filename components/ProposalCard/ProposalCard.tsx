import { useMemo } from 'react';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import { accountsAtom } from 'store/account';
import { currentDaoAtom } from 'store/dao';
import { currentBlockAtom } from 'store/api';

import { getProposalSettings } from 'utils/getProposalSettings';
import { parseMeta } from 'utils/parseMeta';
import { maskAddress } from 'utils/maskAddress';
import { formatBalance } from 'utils/formatBalance';

import type {
  AddMemberProposal,
  CouncilProposalMeta,
  DemocracyProposalMeta,
  DemocracyReferendumMeta,
  EthGovernanceProposalMeta,
  GovernanceV1,
  RemoveMemberProposal,
  SpendProposal,
  TransferProposal
} from 'types';

import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Card } from 'components/ui-kit/Card';
import { Chip } from 'components/ui-kit/Chip';
import { Typography } from 'components/ui-kit/Typography';
import { Countdown } from 'components/Countdown';

import { CouncilProposalActions } from './CouncilProposalCardActions';
import { DemocracyProposalCardActions } from './DemocracyProposalCardActions';
import { DemocracyReferendumCardActions } from './DemocracyReferendumCardActions';

import styles from './ProposalCard.module.scss';

export interface ProposalCardProps {
  proposal:
    | CouncilProposalMeta
    | DemocracyProposalMeta
    | DemocracyReferendumMeta
    | EthGovernanceProposalMeta;
}

type ProposalStatus =
  | 'Active'
  | 'Completed'
  | 'Expired'
  | 'Referendum'
  | 'Started';

export function ProposalCard({ proposal }: ProposalCardProps) {
  const accounts = useAtomValue(accountsAtom);
  const { proposalTitle, icon } = getProposalSettings(proposal.kind);
  const currentDao = useAtomValue(currentDaoAtom);
  const currentBlock = useAtomValue(currentBlockAtom);

  const proposalStatus: ProposalStatus = useMemo(() => {
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
      case 'Started': {
        return 'Started';
      }
      default: {
        return 'Completed';
      }
    }
  }, [proposal.status]);

  const meta = parseMeta(proposal.meta);
  const title = meta?.title;
  const description = meta?.description;

  const seconds = [];

  const countdown = useMemo(() => {
    if (!currentBlock || !currentDao) {
      return null;
    }

    const { proposalPeriod, governance } = currentDao.policy;
    const { votingPeriod } = governance as GovernanceV1;

    const end =
      proposal.__typename === 'DemocracyReferendum'
        ? votingPeriod - (currentBlock % votingPeriod)
        : proposal.blockNum + proposalPeriod - currentBlock;

    if (
      end < 0 ||
      (proposal.status !== 'Open' && proposal.status !== 'Started')
    ) {
      return null;
    }

    return (
      <Countdown endBlock={end} orientation="horizontal" typography="value5" />
    );
  }, [currentBlock, currentDao, proposal]);

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles['status-container']}>
          <Icon
            name="circle"
            className={clsx(
              styles['status-icon'],
              styles[`icon-${proposalStatus.toLowerCase()}`]
            )}
          />
          <Typography variant="title7">{proposalStatus}</Typography>
        </div>
        {proposal.status === 'Open' &&
          proposal.__typename !== 'DemocracyProposal' &&
          countdown}
      </div>
      <div className={styles.content}>
        <div className={styles['proposal-title-container']}>
          <Icon name={icon} className={styles['proposal-icon']} />
          <div className={styles['proposal-title-items']}>
            <div className={styles['proposal-title-item']}>
              <Typography variant="title2">{proposalTitle}</Typography>
              <span>
                <Chip
                  variant="proposal"
                  color={
                    proposal.__typename === 'CouncilProposal'
                      ? 'dark-blue'
                      : 'dark-green'
                  }
                >
                  <Typography variant="title6">
                    {proposal.__typename === 'CouncilProposal'
                      ? 'Council'
                      : 'Democracy'}
                  </Typography>
                </Chip>
              </span>
            </div>
          </div>
        </div>

        <div className={styles['proposal-center-container']}>
          {title && <Typography variant="title5">{title}</Typography>}
          {description && (
            <Typography variant="body2">{description}</Typography>
          )}
        </div>

        <div className={styles['proposal-bottom-container']}>
          <div className={styles['proposal-item-container']}>
            <Typography variant="caption2">Proposer&nbsp;</Typography>
            <span className={styles['proposal-item']}>
              <Icon name="user-profile" size="xs" />
              <Typography variant="value6">
                {(accounts?.find(
                  (_account) => _account.address === proposal.account.id
                )?.meta.name as string) ?? maskAddress(proposal.account.id)}
              </Typography>
            </span>
          </div>

          {(proposal.kind.__typename === 'TransferToken' ||
            proposal.kind.__typename === 'Spend') && (
            <>
              <div className={styles['proposal-item-container']}>
                <span className={styles['proposal-transfer-info']}>
                  <Typography variant="caption3">Amount</Typography>
                  <Typography variant="title5">
                    {formatBalance(proposal.kind.amount)}
                  </Typography>
                </span>
              </div>
              <div>
                <div className={styles['proposal-transfer-info']}>
                  <Typography variant="caption3">Target</Typography>
                  <Typography variant="title5">
                    {(accounts?.find(
                      (_account) =>
                        _account.address ===
                        (proposal.kind as SpendProposal | TransferProposal)
                          .beneficiary
                    )?.meta.name as string) ??
                      maskAddress(proposal.kind.beneficiary)}
                  </Typography>
                </div>
              </div>
            </>
          )}
          {(proposal.kind.__typename === 'AddMember' ||
            proposal.kind.__typename === 'RemoveMember') && (
            <div className={styles['proposal-item-container']}>
              <Typography variant="caption3">Member</Typography>
              <span className={styles['proposal-member-address']}>
                <Icon name="user-profile" size="xs" />
                <Typography variant="title5">
                  {(accounts?.find(
                    (_account) =>
                      _account.address ===
                      (
                        proposal.kind as
                          | AddMemberProposal
                          | RemoveMemberProposal
                      ).who
                  )?.meta.name as string) ?? proposal.kind.who}
                </Typography>
              </span>
            </div>
          )}
          {proposal.__typename === 'DemocracyReferendum' && (
            <div className={styles['proposal-item-container']}>
              <Typography variant="caption3">Referendum</Typography>
              <Typography variant="title5">{proposal.index}</Typography>
            </div>
          )}

          {proposal.__typename === 'DemocracyProposal' &&
            seconds.length > 0 && (
              <div className={styles['proposal-item-container']}>
                <Typography variant="title7">
                  235 users seconded this proposal
                </Typography>
                <span className={styles['seconded-container']}>
                  <span className={styles['profile-pictures']}>
                    {Array.from(Array(10).keys()).map((x) => (
                      <Icon key={x} name="user-profile" size="sm" />
                    ))}
                  </span>
                  <Button variant="text" className={styles['button-see-all']}>
                    <Typography variant="button1">See all</Typography>
                  </Button>
                </span>
              </div>
            )}
          {proposal.__typename === 'CouncilProposal' && (
            <CouncilProposalActions proposal={proposal} />
          )}
        </div>
      </div>
      {proposal.__typename === 'DemocracyProposal' && (
        <DemocracyProposalCardActions proposal={proposal} />
      )}
      {proposal.__typename === 'DemocracyReferendum' && (
        <DemocracyReferendumCardActions proposal={proposal} />
      )}
    </Card>
  );
}
