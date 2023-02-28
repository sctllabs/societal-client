import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import { useAtomValue } from 'jotai';
import { daosAtom } from 'store/dao';
import { currentAccountAtom } from 'store/account';

import { Hero } from 'components/Hero';
import { Overview } from 'components/Overview';

export default function Home() {
  const currentAccount = useAtomValue(currentAccountAtom);
  const daos = useAtomValue(daosAtom);
  const router = useRouter();

  useEffect(() => {
    if (!daos?.length || !currentAccount) {
      return;
    }

    router.push(`/daos/${daos[0].id}/dashboard`);
  }, [currentAccount, daos, router]);

  return (
    <>
      <Head>
        <title>Societal - Welcome to Society 3.0</title>
        <meta name="description" content="Societal web application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {currentAccount ? <Overview /> : <Hero />}
    </>
  );
}
