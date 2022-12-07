import { forwardRef, ComponentProps } from 'react';
import clsx from 'clsx';

import { Icon, IconNamesType } from 'components/ui-kit/Icon';

import styles from './Button.module.scss';

type ButtonVariants =
  | 'filled'
  | 'outlined'
  | 'text'
  | 'link'
  | 'ghost'
  | 'icon';
type ButtonColors = 'primary' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariants;
  color?: ButtonColors;
  size?: ButtonSize;
  iconLeft?: IconNamesType;
  iconRight?: IconNamesType;
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
      iconLeft,
      iconRight,
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
          {
            [styles[`icon-${size}`]]: icon
          },
          {
            [styles[`button-${size}`]]: !icon
          },
          { [styles.fullWidth]: fullWidth },
          className
        )}
        {...btnProps}
      >
        {iconLeft && <Icon name={iconLeft} className={styles['icon-left']} />}
        <span className={clsx(styles.content, styles[`text-${size}`])}>
          {children}
        </span>
        {iconRight && (
          <Icon name={iconRight} className={styles['icon-right']} />
        )}
      </button>
    );
  }
);
