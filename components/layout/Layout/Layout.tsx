import { ReactNode } from 'react';

import { Header } from 'components/layout/Header';
import { Drawer } from 'components/layout/Drawer';

import styles from './Layout.module.scss';

export interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <Drawer />
      <main className={styles.root}>{children}</main>
    </>
  );
}
