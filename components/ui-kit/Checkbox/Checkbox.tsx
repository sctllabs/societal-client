import React, { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import { useControlled } from 'hooks/components';

import styles from './Checkbox.module.scss';

export const Checkbox = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Checkbox(
  {
    checked: checkedProp,
    className,
    onChange,
    color,
    defaultChecked,
    ...otherProps
  },
  ref
) {
  const [checked, setCheckedState] = useControlled({
    controlled: checkedProp,
    default: Boolean(defaultChecked),
    name: 'CheckboxBase',
    state: 'checked'
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.nativeEvent.defaultPrevented) {
      return;
    }

    setCheckedState(event.target.checked);

    if (onChange) {
      onChange(event);
    }
  };

  return (
    <input
      className={clsx(styles.checkbox, className)}
      checked={checked}
      onChange={handleInputChange}
      {...otherProps}
      type="checkbox"
      aria-checked={checked}
      ref={ref}
    />
  );
});
