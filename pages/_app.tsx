import type { AppProps } from 'next/app';
import { Rajdhani, Dosis } from '@next/font/google';
import 'styles/globals.scss';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700']
});

const dosis = Dosis({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        :root {
          --rajdhani-font: ${rajdhani.style.fontFamily};
          --dosis-font: ${dosis.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
