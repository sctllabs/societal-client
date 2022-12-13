import Head from 'next/head';

import { useAtomValue } from 'jotai';
import { currentAccountAtom } from 'store/api';

import { Hero } from 'components/Hero';
import { Overview } from 'components/Overview';

export default function Home() {
  const currentAccount = useAtomValue(currentAccountAtom);

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
