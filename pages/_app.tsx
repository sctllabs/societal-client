import type { AppProps } from 'next/app';
import { Provider } from 'jotai';
import { Rajdhani } from '@next/font/google';

import { Layout } from 'components/Layout';

import 'styles/globals.scss';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700']
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        :root {
          --rajdhani-font: ${rajdhani.style.fontFamily};
        }
      `}</style>

      <Provider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Provider>
    </>
  );
}
