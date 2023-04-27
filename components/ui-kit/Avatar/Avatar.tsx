import { HTMLAttributes, useState } from 'react';
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
  const [error, setError] = useState<boolean>(false);
  const { color, backgroundColor, children } = stringAvatar(value);

  const onError = () => setError(true);

  if (!error && link) {
    return (
      <span className={clsx(styles.root, styles[radius], className)}>
        <span className={styles.container}>
          <img
            className={styles.img}
            src={link}
            alt={value}
            onError={onError}
          />
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
