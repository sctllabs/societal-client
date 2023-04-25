import { ChangeEventHandler, useEffect, useState } from 'react';
import { SetStateAction } from 'jotai';

import { Period } from 'constants/period';

import { convertTimeToBlock } from 'utils/convertTimeToBlock';

import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from 'components/ui-kit/Select';

import styles from './CreateDao.module.scss';

type PeriodInputProps = {
  title: string;
  subtitle: string;
  periodLabel: string;
  atom: string;
  setPeriod: (update?: SetStateAction<number | undefined>) => void;
};

export function PeriodInput({
  title,
  subtitle,
  periodLabel,
  atom,
  setPeriod
}: PeriodInputProps) {
  const [state, setState] = useState({
    period: '',
    periodType: Period.DAYS
  });

  useEffect(() => {
    setPeriod(convertTimeToBlock(state.period, state.periodType));
  }, [atom, setPeriod, state]);

  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetValue = target.value;

    setState((prevState) => ({
      ...prevState,
      period: targetValue.replace(/[^0-9]/g, '')
    }));
  };

  const onSelectChange = (periodType: Period) =>
    setState((prevState) => ({
      ...prevState,
      periodType
    }));

  return (
    <div className={styles['proposal-period-item']}>
      <Typography variant="title4">{title}</Typography>
      <Typography variant="body1">{subtitle}</Typography>

      <div className={styles['proposal-period-input']}>
        <Input
          name={atom}
          label={periodLabel}
          value={state.period}
          onChange={onInputChange}
          type="tel"
          required
          endAdornment={
            <Select
              onValueChange={onSelectChange}
              defaultValue={state.periodType}
            >
              <SelectTrigger className={styles['period-trigger']}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Period).map((_proposalPeriod) => (
                  <SelectItem value={_proposalPeriod} key={_proposalPeriod}>
                    <Typography variant="body2">{_proposalPeriod}</Typography>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
      </div>
    </div>
  );
}
