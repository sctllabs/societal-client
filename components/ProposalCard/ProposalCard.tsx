import { useAtomValue } from 'jotai';
import { accountsAtom } from 'store/account';
import { currentDaoAtom } from 'store/dao';
import { appConfig } from 'config';

import { getProposalSettings } from 'utils/getProposalSettings';

import type {
  AddMemberProposal,
  CouncilProposalMeta,
  DemocracyProposalMeta,
  RemoveMemberProposal,
  SpendProposal,
  TransferProposal
} from 'types';

import { Icon } from 'components/ui-kit/Icon';
import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { Countdown } from 'components/Countdown';

import styles from './ProposalCard.module.scss';
import { CouncilProposalActions } from './CouncilProposalCardActions';
import { DemocracyProposalCardActions } from './DemocracyProposalCardActions';
import { Chip } from '../ui-kit/Chip';
import { parseMeta } from '../../utils/parseMeta';

export interface ProposalCardProps {
  proposal: CouncilProposalMeta | DemocracyProposalMeta;
  currentBlock: number | null;
}

export function ProposalCard({ proposal, currentBlock }: ProposalCardProps) {
  const accounts = useAtomValue(accountsAtom);
  const { proposalTitle, icon } = getProposalSettings(proposal.kind);
  const currentDao = useAtomValue(currentDaoAtom);

  const meta = parseMeta(proposal.meta);
  const title = meta?.title;
  const description = meta?.description;

  return (
    <Card className={styles.card}>
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
                    proposal.__typename === 'DemocracyProposal'
                      ? 'dark-green'
                      : 'dark-blue'
                  }
                >
                  <Typography variant="title6">
                    {proposal.__typename === 'DemocracyProposal'
                      ? 'Democracy'
                      : 'Council'}
                  </Typography>
                </Chip>
              </span>
            </div>
            {proposal.status === 'Open' && currentDao && currentBlock && (
              <div className={styles['proposal-title-item-countdown']}>
                <Countdown
                  end={
                    (proposal.blockNum +
                      currentDao.policy.proposalPeriod -
                      currentBlock) *
                    1000 *
                    appConfig.expectedBlockTimeInSeconds
                  }
                  typography="value5"
                />
                <Typography variant="caption2">left</Typography>
              </div>
            )}
          </div>
        </div>

        <div className={styles['proposal-center-container']}>
          {title && <Typography variant="title5">{title}</Typography>}
          {description && (
            <Typography variant="body2">{description}</Typography>
          )}
        </div>

        <div className={styles['proposal-bottom-container']}>
          {(proposal.kind.__typename === 'TransferToken' ||
            proposal.kind.__typename === 'Spend') && (
            <span className={styles['proposal-transfer-container']}>
              <span className={styles['proposal-transfer-info']}>
                <Typography variant="caption3">Amount</Typography>
                <Typography variant="title5">
                  {new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2
                  }).format(proposal.kind.amount)}
                </Typography>
              </span>
              <span className={styles['proposal-transfer-info']}>
                <Typography variant="caption3">Target</Typography>
                <Typography variant="title5">
                  {(accounts?.find(
                    (_account) =>
                      _account.address ===
                      (proposal.kind as SpendProposal | TransferProposal)
                        .beneficiary
                  )?.meta.name as string) ?? proposal.kind.beneficiary}
                </Typography>
              </span>
            </span>
          )}
          {(proposal.kind.__typename === 'AddMember' ||
            proposal.kind.__typename === 'RemoveMember') && (
            <span className={styles['proposal-member-info']}>
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
            </span>
          )}
          {proposal.__typename === 'CouncilProposal' && (
            <CouncilProposalActions proposal={proposal} />
          )}
        </div>
      </div>
      {proposal.__typename === 'DemocracyProposal' && (
        <DemocracyProposalCardActions proposal={proposal} />
      )}
    </Card>
  );
}
