import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

import styles from './Chip.module.scss';

type ChipVariant = 'filter' | 'group' | 'status' | 'task';

type ChipColor = 'default' | 'active' | 'green' | 'blue' | 'red' | 'orange';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  children: ReactNode;
  color?: ChipColor;
}

export function Chip({
  className,
  children,
  variant = 'filter',
  color = 'default',
  ...otherProps
}: ChipProps) {
  return (
    <span
      className={clsx(
        styles.root,
        styles[variant],
        styles[`color-${color}`],
        className
      )}
      {...otherProps}
    >
      {children}
    </span>
  );
}
