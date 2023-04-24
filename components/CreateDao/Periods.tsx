import { SetStateAction, useAtomValue, useSetAtom } from 'jotai';
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
  BasicPeriodInputType,
  BountyPeriodInputType,
  GovernancePeriodInputType
} from 'types';

import { PeriodInput } from './PeriodInput';

import styles from './CreateDao.module.scss';

const basicPeriods: BasicPeriodInputType[] = [
  {
    title: 'Proposal Period',
    subtitle: 'Determine the duration of your сouncil proposals.',
    label: 'Proposal Period',
    atom: 'proposalPeriodAtom'
  },
  {
    title: 'Spend Period',
    subtitle: 'Periodic treasury spend period used for bounties funding.',
    label: 'Spend Period',
    atom: 'spendPeriodAtom'
  }
];

const governancePeriods: GovernancePeriodInputType[] = [
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
    title: 'Bounty Award Delay',
    subtitle:
      'The delay period for which bounty beneficiary need to wait before claim the payout.',
    label: 'Bounty Award Delay',
    atom: 'awardDelayPeriodAtom'
  }
];

const periodsInputs = {
  basicPeriods,
  governancePeriods,
  bountyPeriods
};

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

  return (
    <div className={styles.periods}>
      {Object.entries(periodsInputs).map(([key, inputs]) => {
        if (
          key === 'governancePeriods' &&
          !governance.includes(GovernanceFungibleToken.GovernanceV1)
        ) {
          return null;
        }

        return inputs.map((_periodInput) => {
          let setPeriod: (update?: SetStateAction<number | undefined>) => void;

          switch (_periodInput.atom) {
            case 'proposalPeriodAtom': {
              setPeriod = setProposalPeriod;
              break;
            }
            case 'spendPeriodAtom': {
              setPeriod = setSpendPeriod;
              break;
            }
            case 'votingPeriodAtom': {
              setPeriod = setVotingPeriod;
              break;
            }
            case 'enactmentPeriodAtom': {
              setPeriod = setEnactmentPeriod;
              break;
            }
            case 'voteLockingPeriodAtom': {
              setPeriod = setVoteLockingPeriod;
              break;
            }
            case 'launchPeriodAtom': {
              setPeriod = setLaunchPeriod;
              break;
            }
            case 'updatePeriodAtom': {
              setPeriod = setUpdatePeriod;
              break;
            }
            case 'awardDelayPeriodAtom': {
              setPeriod = setAwardDelayPeriod;
              break;
            }
            default: {
              throw new Error(UNEXPECTED_ATOM_VALUE);
            }
          }

          return (
            <PeriodInput
              key={_periodInput.title}
              title={_periodInput.title}
              subtitle={_periodInput.subtitle}
              periodLabel={_periodInput.label}
              atom={_periodInput.atom}
              setPeriod={setPeriod}
            />
          );
        });
      })}
    </div>
  );
}
