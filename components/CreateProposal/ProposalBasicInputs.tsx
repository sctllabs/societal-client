import { ChangeEventHandler, Dispatch, SetStateAction } from 'react';

import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';

import { InputLabel, InputName, ProposalBasicState } from './types';

type ProposalBasicInputsProps = {
  state: ProposalBasicState;
  setState: Dispatch<SetStateAction<ProposalBasicState>>;
};

const MAX_INPUT_LENGTH = 500;

export function ProposalBasicInputs({
  state,
  setState
}: ProposalBasicInputsProps) {
  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name;
    const targetValue = target.value;

    setState((prevState) => ({
      ...prevState,
      [targetName]: targetValue
    }));
  };

  return (
    <>
      <Input
        name={InputName.TITLE}
        label={InputLabel.TITLE}
        value={state.title}
        onChange={onInputChange}
        maxLength={MAX_INPUT_LENGTH}
        hint={
          <Typography variant="caption3">{state.title.length}/500</Typography>
        }
        required
      />

      <Input
        name={InputName.DESCRIPTION}
        label={InputLabel.DESCRIPTION}
        value={state.description}
        onChange={onInputChange}
        maxLength={MAX_INPUT_LENGTH}
        hint={
          <Typography variant="caption3">
            {state.description.length}/500
          </Typography>
        }
        required
      />
    </>
  );
}
