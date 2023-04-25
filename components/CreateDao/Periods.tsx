import { useCallback } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  awardDelayPeriodAtom,
  enactmentPeriodAtom,
  governanceAtom,
  launchPeriodAtom,
  proposalPeriodAtom,
  spendPeriodAtom,
  updatePeriodAtom,
  voteLockingPeriodAtom,
  votingPeriodAtom
} from 'store/createDao';
import { GovernanceFungibleToken } from 'constants/governance';
import { UNEXPECTED_ATOM_VALUE } from 'constants/errors';
import type {
  BountyPeriodAtom,
  BountyPeriodInputType,
  GovernancePeriodAtom,
  ProposalPeriodInputType
} from 'types';

import { Typography } from 'components/ui-kit/Typography';

import { PeriodInput } from './PeriodInput';

import styles from './CreateDao.module.scss';

const governancePeriods: ProposalPeriodInputType[] = [
  {
    title: 'Proposal Period',
    subtitle: 'Determine the duration of your сouncil proposals.',
    label: 'Proposal Period',
    atom: 'proposalPeriodAtom'
  },
  {
    title: 'Launch Period',
    subtitle: 'How often new public referenda are launched.',
    label: 'Launch Period',
    atom: 'launchPeriodAtom'
  },
  {
    title: 'Voting Period',
    subtitle: 'The time token holders have to vote for a referendum.',
    label: 'Voting Period',
    atom: 'votingPeriodAtom'
  },
  {
    title: 'Enactment Period',
    subtitle: 'The period between a proposal being approved and enacted.',
    label: 'Enactment Period',
    atom: 'enactmentPeriodAtom'
  },
  {
    title: 'Vote Locking Period',
    subtitle: 'The minimum period of vote locking.',
    label: 'Vote Locking Period',
    atom: 'voteLockingPeriodAtom'
  }
];

const bountyPeriods: BountyPeriodInputType[] = [
  {
    title: 'Bounty Update Period',
    subtitle: 'Bounty duration. Can be extended by curator.',
    label: 'Bounty Update Period',
    atom: 'updatePeriodAtom'
  },
  {
    title: 'Spend Period',
    subtitle: 'Periodic treasury spend period used for bounties funding.',
    label: 'Spend Period',
    atom: 'spendPeriodAtom'
  },
  {
    title: 'Bounty Award Delay',
    subtitle:
      'The delay period for which bounty beneficiary need to wait before claim the payout.',
    label: 'Bounty Award Delay',
    atom: 'awardDelayPeriodAtom'
  }
];

export function Periods() {
  const governance = useAtomValue(governanceAtom);
  const setProposalPeriod = useSetAtom(proposalPeriodAtom);
  const setSpendPeriod = useSetAtom(spendPeriodAtom);

  const setVotingPeriod = useSetAtom(votingPeriodAtom);
  const setEnactmentPeriod = useSetAtom(enactmentPeriodAtom);
  const setVoteLockingPeriod = useSetAtom(voteLockingPeriodAtom);
  const setLaunchPeriod = useSetAtom(launchPeriodAtom);

  const setUpdatePeriod = useSetAtom(updatePeriodAtom);
  const setAwardDelayPeriod = useSetAtom(awardDelayPeriodAtom);

  const getPeriod = useCallback(
    (_atom: GovernancePeriodAtom | BountyPeriodAtom) => {
      switch (_atom) {
        case 'proposalPeriodAtom': {
          return setProposalPeriod;
        }
        case 'spendPeriodAtom': {
          return setSpendPeriod;
        }
        case 'votingPeriodAtom': {
          return setVotingPeriod;
        }
        case 'enactmentPeriodAtom': {
          return setEnactmentPeriod;
        }
        case 'voteLockingPeriodAtom': {
          return setVoteLockingPeriod;
        }
        case 'launchPeriodAtom': {
          return setLaunchPeriod;
        }
        case 'updatePeriodAtom': {
          return setUpdatePeriod;
        }
        case 'awardDelayPeriodAtom': {
          return setAwardDelayPeriod;
        }
        default: {
          throw new Error(UNEXPECTED_ATOM_VALUE);
        }
      }
    },
    [
      setAwardDelayPeriod,
      setEnactmentPeriod,
      setLaunchPeriod,
      setProposalPeriod,
      setSpendPeriod,
      setUpdatePeriod,
      setVoteLockingPeriod,
      setVotingPeriod
    ]
  );

  return (
    <>
      <div className={styles.section}>
        <Typography variant="h3">Proposal Settings</Typography>
        <div className={styles.periods}>
          {governancePeriods.map((_periodInput) => {
            if (
              !governance.includes(GovernanceFungibleToken.GovernanceV1) &&
              _periodInput.atom !== 'proposalPeriodAtom'
            ) {
              return null;
            }
            return (
              <PeriodInput
                key={_periodInput.title}
                title={_periodInput.title}
                subtitle={_periodInput.subtitle}
                periodLabel={_periodInput.label}
                atom={_periodInput.atom}
                setPeriod={getPeriod(_periodInput.atom)}
              />
            );
          })}
        </div>
      </div>
      <div className={styles.section}>
        <Typography variant="h3">Bounty Settings</Typography>
        <div className={styles.periods}>
          {bountyPeriods.map((_periodInput) => (
            <PeriodInput
              key={_periodInput.title}
              title={_periodInput.title}
              subtitle={_periodInput.subtitle}
              periodLabel={_periodInput.label}
              atom={_periodInput.atom}
              setPeriod={getPeriod(_periodInput.atom)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
