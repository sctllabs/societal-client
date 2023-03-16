import clsx from 'clsx';

import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';

import { getProposalSettings } from 'utils/getProposalSettings';
import { maskAddress } from 'utils/maskAddress';
import { parseMeta } from 'utils/parseMeta';
import type { CouncilProposalMeta, DemocracyProposalMeta } from 'types';

import { Card } from 'components/ui-kit/Card';
import { Icon } from 'components/ui-kit/Icon';
import { Typography } from 'components/ui-kit/Typography';
import { Chip } from 'components/ui-kit/Chip';
import { Countdown } from 'components/Countdown';

import styles from './TaskCard.module.scss';

export interface TaskCardProps {
  proposal: CouncilProposalMeta | DemocracyProposalMeta;
  currentBlock: number | null;
}

const currency = '$SCTL';

type TaskStatus = 'Active' | 'Completed';

export function TaskCard({ proposal, currentBlock }: TaskCardProps) {
  let taskStatus: TaskStatus;

  const currentDao = useAtomValue(currentDaoAtom);

  const { proposalTitle, icon } = getProposalSettings(proposal.kind);

  switch (proposal.status) {
    case 'Open': {
      taskStatus = 'Active';
      break;
    }
    default: {
      taskStatus = 'Completed';
    }
  }
  const meta = parseMeta(proposal.meta);
  const title = meta?.title;
  const description = meta?.description;

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <div className={styles['status-container']}>
          <Icon
            name="circle"
            className={clsx(
              styles['status-icon'],
              styles[taskStatus === 'Active' ? 'icon-active' : 'icon-completed']
            )}
          />
          <Typography variant="title7">{taskStatus}</Typography>
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
                  <Typography variant="title6">
                    {proposal.__typename === 'DemocracyProposal'
                      ? 'Democracy'
                      : 'Council'}
                  </Typography>
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
                  {maskAddress(proposal.account.id)}
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
                      {new Intl.NumberFormat('en-US', {
                        minimumFractionDigits: 2
                      }).format(proposal.kind.amount)}
                    </Typography>
                    <Typography variant="body2">
                      {proposal.kind.__typename === 'TransferToken'
                        ? currentDao?.fungibleToken.symbol || ''
                        : currency}
                    </Typography>
                  </span>
                </span>
                <span className={styles['proposal-item-info']}>
                  <Typography variant="caption2">Target</Typography>
                  <span className={styles['proposal-item']}>
                    <Icon name="user-profile" size="xs" />
                    <Typography variant="title5">
                      {maskAddress(proposal.kind.beneficiary)}
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
                    {maskAddress(proposal.kind.who)}
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
