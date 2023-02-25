import { ChangeEventHandler, Dispatch, SetStateAction } from 'react';
import * as Label from '@radix-ui/react-label';
import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';
import { Button } from 'components/ui-kit/Button';
import { Dropdown } from 'components/ui-kit/Dropdown';
import { Icon } from 'components/ui-kit/Icon';
import { RadioGroup, RadioGroupItem } from 'components/ui-kit/Radio';
import { Card } from 'components/ui-kit/Card';

import {
  DaoGovernanceState,
  PeriodName,
  PeriodTypeName,
  ProposalPeriod
} from './types';
import styles from './CreateDAO.module.scss';

type PeriodInputProps = {
  title: string;
  subtitle: string;
  state: DaoGovernanceState;
  setState: Dispatch<SetStateAction<DaoGovernanceState>>;
  periodLabel: string;
  periodName: PeriodName;
  periodTypeName: PeriodTypeName;
};

export function PeriodInput({
  title,
  subtitle,
  state,
  periodLabel,
  periodName,
  periodTypeName,
  setState
}: PeriodInputProps) {
  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name;
    const targetValue = target.value;

    setState((prevState) => ({
      ...prevState,
      [targetName]:
        targetName === periodName
          ? targetValue.replace(/[^0-9]/g, '')
          : targetValue
    }));
  };

  const onProposalPeriodTypeChange = (proposalPeriodType: ProposalPeriod) =>
    setState((prevState) => ({
      ...prevState,
      [periodTypeName]: proposalPeriodType
    }));

  return (
    <div className={styles['proposal-period-item']}>
      <Typography variant="h3">{title}</Typography>
      <Typography variant="body1">{subtitle}</Typography>

      <div className={styles['proposal-period-input']}>
        <Input
          name={periodName}
          label={periodLabel}
          value={state[periodName]}
          onChange={onInputChange}
          type="tel"
          required
          endAdornment={
            <Dropdown
              dropdownItems={
                <Card dropdown className={styles['dropdown-card']}>
                  <RadioGroup
                    value={state[periodTypeName]}
                    className={styles['dropdown-radio-group']}
                    onValueChange={onProposalPeriodTypeChange}
                    name={periodTypeName}
                  >
                    {Object.values(ProposalPeriod).map(
                      (_proposalPeriodType) => (
                        <div
                          key={_proposalPeriodType}
                          className={styles['dropdown-content-span']}
                        >
                          <RadioGroupItem
                            value={_proposalPeriodType}
                            id={_proposalPeriodType}
                          />
                          <Label.Root htmlFor={_proposalPeriodType}>
                            <Typography variant="body2">
                              {_proposalPeriodType}
                            </Typography>
                          </Label.Root>
                        </div>
                      )
                    )}
                  </RadioGroup>
                </Card>
              }
            >
              <Button
                variant="text"
                className={styles['proposal-period-button']}
                size="sm"
              >
                <div className={styles['proposal-period-dropdown']}>
                  <Typography variant="body2">
                    {state[periodTypeName]}
                  </Typography>
                  <Icon name="arrow-down" size="sm" />
                </div>
              </Button>
            </Dropdown>
          }
        />
      </div>
    </div>
  );
}
