import { ReactNode } from 'react';

import { Header } from 'components/layout/Header';

import styles from './Layout.module.scss';

export interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <main className={styles.root}>{children}</main>
    </>
  );
}
