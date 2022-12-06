import { forwardRef, ComponentProps } from 'react';
import clsx from 'clsx';

import { Icon, IconNamesType } from 'components/ui-kit/Icon';

import styles from './Button.module.scss';

type ButtonVariants = 'filled' | 'outlined' | 'text' | 'link';
type ButtonColors = 'primary' | 'destructive' | 'cta' | 'destructive';
type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariants;
  color?: ButtonColors;
  size?: ButtonSize;
  iconLeft?: IconNamesType;
  iconRight?: IconNamesType;
  fullWidth?: boolean;
  contentGutters?: boolean;
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
      contentGutters = true,
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
        {iconLeft && <Icon name={iconLeft} />}
        <span
          className={clsx(styles.content, styles[`text-${size}`], {
            [styles.contentGutters]: contentGutters
          })}
        >
          {children}
        </span>
        {iconRight && <Icon name={iconRight} />}
      </button>
    );
  }
);
