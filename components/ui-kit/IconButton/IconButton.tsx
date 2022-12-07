import { forwardRef } from 'react';
import clsx from 'clsx';

import { Icon, IconNamesType } from 'components/ui-kit/Icon';
import { Button, ButtonProps } from 'components/ui-kit/Button';

import styles from './IconButton.module.scss';

export interface IconButtonProps
  extends Omit<ButtonProps, 'iconLeft' | 'iconRight' | 'ref'> {
  size?: 'sm' | 'md' | 'lg';
  icon: IconNamesType;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function BaseIconButton(
    { icon, color, size = 'md', className, ...btnProps },
    ref
  ) {
    return (
      <Button
        ref={ref}
        className={clsx(styles.root, styles[size], className)}
        color={color}
        {...btnProps}
      >
        <Icon name={icon} size={size} color={color} />
      </Button>
    );
  }
);
