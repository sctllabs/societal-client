import { HTMLAttributes } from 'react';
import clsx from 'clsx';
import { stringAvatar } from 'utils/stringAvatar';

import styles from './Avatar.module.scss';

export interface AvatarProps extends HTMLAttributes<HTMLInputElement> {
  value: string;
}

export function Avatar({ value, className }: AvatarProps) {
  const { color, backgroundColor, children } = stringAvatar(value);
  return (
    <span
      style={{ backgroundColor, color }}
      className={clsx(styles.root, className)}
    >
      {children}
    </span>
  );
}
