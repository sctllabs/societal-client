import { Dispatch, SetStateAction } from 'react';
import * as Label from '@radix-ui/react-label';

import { CircularProgress } from 'components/ui-kit/CircularProgress';
import { Typography } from 'components/ui-kit/Typography';
import { RadioGroup, RadioGroupItem } from 'components/ui-kit/Radio';

import { ApproveOrigin, BasicPeriodInputType, DaoBasicState } from './types';
import { PeriodInput } from './PeriodInput';

import styles from './CreateDAO.module.scss';

const periodInputs: BasicPeriodInputType[][] = [
  [
    {
      title: 'Proposal Period',
      subtitle: 'Determine the duration of your сouncil proposals.',
      label: 'Proposal Period',
      periodName: 'proposalPeriod',
      periodTypeName: 'proposalPeriodType'
    },
    {
      title: 'Spend Period',
      subtitle: 'Periodic treasury spend period used for bounties funding.',
      label: 'Spend Period',
      periodName: 'spendPeriod',
      periodTypeName: 'spendPeriodType'
    }
  ]
];

type DaoBasicProps = {
  state: DaoBasicState;
  setState: Dispatch<SetStateAction<DaoBasicState>>;
};

const defaultApproveOrigin = '1/2';

export function DaoBasic({ state, setState }: DaoBasicProps) {
  const onApproveOriginChange = (approveOrigin: keyof typeof ApproveOrigin) =>
    setState((prevState) => ({ ...prevState, approveOrigin }));

  return (
    <>
      <div className={styles['approve-origin']}>
        <Typography variant="h3">Approve Origin</Typography>
        <Typography variant="body1">
          Basic quorum required for council proposals to be approved.
        </Typography>
        <RadioGroup
          className={styles['approve-origin-radio-group']}
          defaultValue={defaultApproveOrigin}
          onValueChange={onApproveOriginChange}
        >
          {(Object.keys(ApproveOrigin) as (keyof typeof ApproveOrigin)[]).map(
            (_approveOriginKey) => (
              <div
                key={_approveOriginKey}
                className={styles['approve-origin-radio']}
              >
                <span className={styles['approve-origin-radio-span']}>
                  <RadioGroupItem
                    id={_approveOriginKey}
                    value={_approveOriginKey}
                  />
                  <Label.Root htmlFor={_approveOriginKey}>
                    <Typography variant="body2">{_approveOriginKey}</Typography>
                  </Label.Root>
                </span>
                <CircularProgress
                  value={parseInt(
                    ApproveOrigin[_approveOriginKey].replace('%', ''),
                    10
                  )}
                />
              </div>
            )
          )}
        </RadioGroup>
      </div>
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
    </>
  );
}