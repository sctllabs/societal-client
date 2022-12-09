import { ReactNode } from 'react';
import clsx from 'clsx';

import styles from './Card.module.scss';

export interface CardProps {
  children?: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return <div className={clsx(styles.root, className)}>{children}</div>;
}
