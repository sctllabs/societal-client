import { KeyboardEventHandler, MouseEventHandler, ReactNode } from 'react';
import clsx from 'clsx';

import styles from './Card.module.scss';

export interface CardProps {
  children?: ReactNode;
  dropdown?: boolean;
  className?: string;
  active?: boolean;
  onClick?: MouseEventHandler;
  onKeyDown?: KeyboardEventHandler;
}

export function Card({
  children,
  className,
  dropdown,
  active,
  onClick,
  onKeyDown,
  ...otherProps
}: CardProps) {
  return (
    <div
      className={clsx(
        styles.root,
        { [styles.dropdown]: dropdown, [styles.active]: active },
        className
      )}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="presentation"
      {...otherProps}
    >
      {children}
    </div>
  );
}
