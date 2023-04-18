import { ChangeEventHandler, Dispatch, SetStateAction } from 'react';

import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';

import type { DaoInfoState } from './types';
import styles from './CreateDAO.module.scss';

const PURPOSE_INPUT_MAX_LENGTH = 500;

enum InputName {
  NAME = 'name',
  PURPOSE = 'purpose'
}

enum InputLabel {
  NAME = '* Community Name',
  PURPOSE = '* Purpose'
}

type DaoInfoProps = {
  state: DaoInfoState;
  setState: Dispatch<SetStateAction<DaoInfoState>>;
};

export function DaoInfo({ state, setState }: DaoInfoProps) {
  const onChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name;
    const targetValue = target.value;

    setState((prevState) => ({
      ...prevState,
      [targetName]: targetValue
    }));
  };

  return (
    <div className={styles.info}>
      <Typography variant="h3">Community Info</Typography>
      <Input
        name={InputName.NAME}
        label={InputLabel.NAME}
        value={state.name}
        onChange={onChange}
        required
      />
      <Input
        name={InputName.PURPOSE}
        label={InputLabel.PURPOSE}
        onChange={onChange}
        value={state.purpose}
        maxLength={PURPOSE_INPUT_MAX_LENGTH}
        hint={
          <Typography variant="caption3">{state.purpose.length}/500</Typography>
        }
        hintPosition="end"
        required
      />
    </div>
  );
}
