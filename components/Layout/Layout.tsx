import { ReactNode, useEffect } from 'react';

import { Header } from 'components/Layout/Header';
import { Sidebar } from 'components/Layout/Sidebar';

import { connect } from 'services';

import styles from './Layout.module.scss';

export interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  useEffect(() => {
    void connect();
  }, []);

  return (
    <>
      <Header />
      <Sidebar />
      <main className={styles.root}>{children}</main>
    </>
  );
}
