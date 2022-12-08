import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react';
import clsx from 'clsx';

import styles from './Input.module.scss';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    startAdornment,
    endAdornment,
    color,
    label,
    error,
    value,
    ...otherProps
  },
  ref
) {
  const id = useId();

  return (
    <div className={clsx(styles.root, { [styles.invalid]: error })}>
      {startAdornment}
      <input
        id={id}
        value={value}
        className={clsx(
          styles.input,
          {
            [styles.invalid]: error
          },
          className
        )}
        {...otherProps}
        ref={ref}
      />
      {endAdornment}

      {label && (
        <label className={clsx(styles.label)} htmlFor={id}>
          {label}
        </label>
      )}
    </div>
  );
});
