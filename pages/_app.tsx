import type { AppProps } from 'next/app';
import { Provider } from 'jotai';
import { Rajdhani } from '@next/font/google';

import { Layout } from 'components/Layout';
import { Preloader } from 'components/Preloader';
import { Queue } from 'components/Queue';

import 'styles/globals.scss';
import { useRouter } from 'next/router';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700']
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <>
      <style jsx global>{`
        :root {
          --rajdhani-font: ${rajdhani.style.fontFamily};
        }
      `}</style>

      <Provider>
        <Layout>
          <Preloader />
          <Queue />
          <Component {...pageProps} key={router.asPath} />
        </Layout>
      </Provider>
    </>
  );
}
