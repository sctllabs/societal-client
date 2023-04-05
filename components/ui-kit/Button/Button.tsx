/* eslint-disable react/button-has-type */

import { forwardRef, ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

import styles from './Button.module.scss';

export type ButtonVariant =
  | 'filled'
  | 'outlined'
  | 'text'
  | 'link'
  | 'ghost'
  | 'icon'
  | 'nav'
  | 'vote';
export type ButtonColor = 'primary' | 'destructive' | 'success';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function BaseButton(
    {
      variant = 'filled',
      color = 'primary',
      size = 'md',
      className,
      children,
      type = 'button',
      fullWidth = false,
      icon = false,
      ...btnProps
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={clsx(
          styles.root,
          styles[variant],
          styles[color],
          styles[`text-${size}`],
          icon ? styles[`button-icon-${size}`] : styles[`button-${size}`],
          { [styles.fullWidth]: fullWidth },
          className
        )}
        {...btnProps}
      >
        {children}
      </button>
    );
  }
);
