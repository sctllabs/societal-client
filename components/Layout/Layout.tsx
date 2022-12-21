import { ReactNode } from 'react';

import { Header } from 'components/Header';
import { Sidebar } from 'components/Sidebar';
import { MainLoader } from 'components/MainLoader';

import styles from './Layout.module.scss';

export interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <Sidebar />
      <MainLoader />
      <main className={styles.root}>{children}</main>
    </>
  );
}
