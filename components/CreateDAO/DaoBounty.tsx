import { Dispatch, SetStateAction } from 'react';

import { BountyPeriodInputType, DaoBountyState } from './types';
import { PeriodInput } from './PeriodInput';

import styles from './CreateDAO.module.scss';

const periodInputs: BountyPeriodInputType[][] = [
  [
    {
      title: 'Bounty Update Period',
      subtitle: 'Bounty duration. Can be extended by curator.',
      label: 'Bounty Update Period',
      periodName: 'updatePeriod',
      periodTypeName: 'updatePeriodType'
    },
    {
      title: 'Bounty Award Delay',
      subtitle:
        'The delay period for which bounty beneficiary need to wait before claim the payout.',
      label: 'Bounty Award Delay',
      periodName: 'awardDelayPeriod',
      periodTypeName: 'awardDelayPeriodType'
    }
  ]
];

type DaoBountyProps = {
  state: DaoBountyState;
  setState: Dispatch<SetStateAction<DaoBountyState>>;
};

export function DaoBounty({ state, setState }: DaoBountyProps) {
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
