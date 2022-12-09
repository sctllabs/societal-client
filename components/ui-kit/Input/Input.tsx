import {
  ChangeEventHandler,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useId,
  useState
} from 'react';
import clsx from 'clsx';

import styles from './Input.module.scss';
import { Typography } from '../Typography';

type InputVariant = 'standard' | 'outlined';
type InputPadding = 'md' | 'lg';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  label?: string;
  variant?: InputVariant;
  padding?: InputPadding;
  hint?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    variant = 'standard',
    className,
    startAdornment,
    endAdornment,
    color,
    label,
    error,
    hint,
    onChange,
    padding = 'md',
    disabled,
    ...otherProps
  },
  ref
) {
  const id = useId();

  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const handleOnFocus = () => setIsFocused(true);
  const handleOnBlur = () => setIsFocused(false);

  const handleOnChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (onChange) {
      onChange(event);
    }

    const dirty = !!event.target.value;

    if (dirty !== isDirty) {
      setIsDirty(!!event.target.value);
    }
  };

  return (
    <div
      className={clsx(
        styles.root,
        styles[`root-${padding}`],
        styles[`root-${variant}`],
        {
          [styles.error]: error,
          [styles.disabled]: disabled
        }
      )}
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
    >
      {startAdornment}
      <input
        id={id}
        disabled={disabled}
        className={clsx(
          styles.input,
          styles[`input-${variant}`],
          styles[`input-${padding}`],
          {
            [styles['start-adornment']]: !!startAdornment,
            [styles['end-adornment']]: !!endAdornment,
            [styles.error]: error
          },
          className
        )}
        {...otherProps}
        ref={ref}
        onChange={handleOnChange}
      />
      {label && (
        <label
          data-focused={isFocused}
          className={clsx(styles.label, styles[`label-${variant}`], {
            [styles['start-adornment']]: !!startAdornment,
            [styles.focused]: isFocused,
            [styles.error]: error,
            [styles.dirty]: isDirty
          })}
          htmlFor={id}
        >
          {label}
        </label>
      )}
      {hint && <span className={clsx(styles.hint)}>{hint}</span>}
      {endAdornment}
    </div>
  );
});
