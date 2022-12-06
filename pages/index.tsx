import Head from 'next/head';
import { Typography } from 'components/ui-kit/Typography';

export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Typography variant={'h1'}>Hello, world!</Typography>
      <Typography variant={'h2'}>Hello, world!</Typography>
      <Typography variant={'h3'}>Hello, world!</Typography>
    </>
  );
}
