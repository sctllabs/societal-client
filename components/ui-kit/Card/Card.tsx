import { KeyboardEventHandler, MouseEventHandler, ReactNode } from 'react';
import clsx from 'clsx';

import styles from './Card.module.scss';

export interface CardProps {
  children?: ReactNode;
  dropdown?: boolean;
  className?: string;
  onClick?: MouseEventHandler;
  onKeyDown?: KeyboardEventHandler;
}

export function Card({
  children,
  className,
  dropdown,
  onClick,
  onKeyDown,
  ...otherProps
}: CardProps) {
  return (
    <div
      className={clsx(styles.root, { [styles.dropdown]: dropdown }, className)}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role="presentation"
      {...otherProps}
    >
      {children}
    </div>
  );
}
