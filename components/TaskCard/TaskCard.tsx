import clsx from 'clsx';
import { appConfig } from 'config';

import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';
import { isEthereumAddress } from '@polkadot/util-crypto';

import { getProposalSettings } from 'utils/getProposalSettings';
import { maskAddress } from 'utils/maskAddress';
import type { CouncilProposalMeta } from 'types';

import { Card } from 'components/ui-kit/Card';
import { Icon } from 'components/ui-kit/Icon';
import { Typography } from 'components/ui-kit/Typography';
import { Countdown } from 'components/Countdown';

import styles from './TaskCard.module.scss';

export interface TaskCardProps {
  proposal: CouncilProposalMeta;
  currentBlock: number | null;
}

const currency = '$SCTL';

type TaskStatus = 'Active' | 'Completed';

export function TaskCard({ proposal, currentBlock }: TaskCardProps) {
  let taskStatus: TaskStatus;

  const currentDao = useAtomValue(currentDaoAtom);

  const { title, icon } = getProposalSettings(proposal.kind);

  switch (proposal.status) {
    case 'Open': {
      taskStatus = 'Active';
      break;
    }
    case 'Executed': {
      taskStatus = 'Completed';
      break;
    }
    default: {
      taskStatus = 'Completed';
    }
  }

  const description = proposal.meta
    ? JSON.parse(proposal.meta).description
    : null;

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
          <div className={styles.countdown}>
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
            <Typography variant="body2">left</Typography>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles['description-container']}>
          <div className={styles.title}>
            <Icon name={icon} className={styles['proposal-icon']} />
            <Typography variant="title4">{title}</Typography>
          </div>
          {description && (
            <Typography variant="title4">{description}</Typography>
          )}

          <div className={styles['proposal-bottom-container']}>
            <span className={styles['proposal-item-info']}>
              <Typography variant="caption2">Proposer&nbsp;</Typography>
              <span className={styles['proposal-item']}>
                <Icon name="user-profile" size="xs" />
                <Typography variant="title5">
                  {maskAddress(
                    proposal.account.id,
                    isEthereumAddress(proposal.account.id) ? 'eth' : 'ss58'
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
                      {maskAddress(
                        proposal.kind.beneficiary,
                        isEthereumAddress(proposal.account.id) ? 'eth' : 'ss58'
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
                      proposal.kind.who,
                      isEthereumAddress(proposal.account.id) ? 'eth' : 'ss58'
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