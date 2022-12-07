import { forwardRef, ComponentProps } from 'react';
import clsx from 'clsx';

import { Icon, IconNamesType } from 'components/ui-kit/Icon';

import styles from './Button.module.scss';

type ButtonVariants =
  | 'filled'
  | 'outlined'
  | 'text'
  | 'link'
  | 'icon'
  | 'ghost';
type ButtonColors = 'primary' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariants;
  color?: ButtonColors;
  size?: ButtonSize;
  iconLeft?: IconNamesType;
  iconRight?: IconNamesType;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function BaseButton(
    {
      variant = 'filled',
      color = 'primary',
      size = 'medium',
      className,
      children,
      iconLeft,
      iconRight,
      type = 'button',
      fullWidth = false,
      ...btnProps
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        // eslint-disable-next-line react/button-has-type
        type={type}
        className={clsx(
          styles.root,
          styles[variant],
          styles[color],
          styles[`button-${size}`],
          { [styles.fullWidth]: fullWidth },
          className
        )}
        {...btnProps}
      >
        {iconLeft && <Icon name={iconLeft} className={styles.iconLeft} />}
        <span className={clsx(styles.content, styles[`text-${size}`])}>
          {children}
        </span>
        {iconRight && <Icon name={iconRight} className={styles.iconRight} />}
      </button>
    );
  }
);
