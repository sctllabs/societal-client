import React, { useCallback, useMemo, useId } from 'react';
import { useControlled } from 'hooks';

import { RadioContextType, RadioContext } from 'context';

export interface RadioGroupProps {
  children: JSX.Element[] | JSX.Element;
  value?: string;
  defaultValue?: string;
  onChange?: RadioContextType['onChange'];
  className?: string;
  name?: string;
}

export function RadioGroup({
  className,
  children,
  value: valueProp,
  defaultValue,
  onChange,
  name: nameProp
}: RadioGroupProps) {
  const [value, setValueState] = useControlled({
    controlled: valueProp,
    default: defaultValue,
    name: 'RadioGroup'
  });
  const nameId = useId();

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValueState(event.target.value);
      if (onChange) {
        onChange(event);
      }
    },
    [onChange, setValueState]
  );

  const name = nameProp || nameId;

  const providerValue = useMemo(
    () => ({
      name,
      state: value,
      onChange: handleChange
    }),
    [handleChange, name, value]
  );

  return (
    <RadioContext.Provider value={providerValue}>
      <div className={className} role="radiogroup">
        {children}
      </div>
    </RadioContext.Provider>
  );
}
