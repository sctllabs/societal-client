import { Dispatch, SetStateAction } from 'react';

import { DaoGovernanceState, GovernancePeriodInputType } from './types';
import { PeriodInput } from './PeriodInput';

import styles from './CreateDAO.module.scss';

const periodInputs: GovernancePeriodInputType[][] = [
  [
    {
      title: 'Launch Period',
      subtitle: 'How often new public referenda are launched.',
      label: 'Launch Period',
      periodName: 'launchPeriod',
      periodTypeName: 'launchPeriodType'
    },
    {
      title: 'Voting Period',
      subtitle: 'The time token holders have to vote for a referendum.',
      label: 'Voting Period',
      periodName: 'votingPeriod',
      periodTypeName: 'votingPeriodType'
    }
  ],
  [
    {
      title: 'Enactment Period',
      subtitle: 'The period between a proposal being approved and enacted.',
      label: 'Enactment Period',
      periodName: 'enactmentPeriod',
      periodTypeName: 'enactmentPeriodType'
    },
    {
      title: 'Vote Locking Period',
      subtitle: 'The minimum period of vote locking.',
      label: 'Vote Locking Period',
      periodName: 'voteLockingPeriod',
      periodTypeName: 'voteLockingPeriodType'
    }
  ]
];

type DaoGovernanceProps = {
  state: DaoGovernanceState;
  setState: Dispatch<SetStateAction<DaoGovernanceState>>;
};

export function DaoGovernance({ state, setState }: DaoGovernanceProps) {
  return (
    <div>
      {periodInputs.map((_periodInputs) => (
        <div
          key={`${_periodInputs[0].title}-${_periodInputs[1]?.title}`}
          className={styles['proposal-period-container']}
        >
          {_periodInputs.map((_periodInput) => (
            <PeriodInput
              key={_periodInput.title}
              title={_periodInput.title}
              subtitle={_periodInput.subtitle}
              periodLabel={_periodInput.label}
              periodName={_periodInput.periodName}
              periodTypeName={_periodInput.periodTypeName}
              state={state}
              setState={setState}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
