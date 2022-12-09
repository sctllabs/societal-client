import { useRef, forwardRef, ComponentProps } from 'react';
import { Transition } from 'react-transition-group';
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
  startIcon?: IconNamesType;
  endIcon?: IconNamesType;
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
      startIcon,
      endIcon,
      type = 'button',
      fullWidth = false,
      icon = false,
      ...btnProps
    },
    ref
  ) {
    const iconRef = useRef(null);

    return (
      <button
        ref={ref}
        type={type}
        className={clsx(
          styles.root,
          styles[variant],
          styles[color],
          styles[`text-${size}`],
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
        {startIcon && <Icon name={startIcon} size={size} />}
        <span
          className={clsx(
            styles.content,
            {
              [styles[`icon-start`]]: startIcon
            },
            {
              [styles[`icon-end`]]: endIcon
            }
          )}
        >
          {children}
        </span>
        <Transition
          nodeRef={iconRef}
          mountOnEnter
          unmountOnExit
          in={!!endIcon}
          timeout={500}
        >
          {endIcon && <Icon size={size} name={endIcon} />}
        </Transition>
      </button>
    );
  }
);
