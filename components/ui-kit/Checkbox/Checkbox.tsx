import React, { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import { useControlled } from 'hooks/useControlled';

import styles from './Checkbox.module.scss';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
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
        className={clsx(styles.root, className)}
        checked={checked}
        onChange={handleInputChange}
        {...otherProps}
        type="checkbox"
        aria-checked={checked}
        ref={ref}
      />
    );
  }
);
