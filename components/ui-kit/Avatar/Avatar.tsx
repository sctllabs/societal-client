import { HTMLAttributes } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import { stringAvatar } from 'utils/stringAvatar';

import styles from './Avatar.module.scss';

type RadiusType = 'rounded' | 'standard';

export interface AvatarProps extends HTMLAttributes<HTMLInputElement> {
  value: string;
  radius?: RadiusType;
  link?: string;
}

export function Avatar({
  value,
  link,
  className,
  radius = 'standard'
}: AvatarProps) {
  const { color, backgroundColor, children } = stringAvatar(value);

  if (link) {
    return (
      <span className={clsx(styles.root, styles[radius], className)}>
        <span className={styles.container}>
          <Image src={link} alt={value} fill />
        </span>
      </span>
    );
  }
  return (
    <span
      style={{ backgroundColor, color }}
      className={clsx(styles.root, styles[radius], className)}
    >
      {children}
    </span>
  );
}
