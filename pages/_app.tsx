import type { AppProps } from 'next/app';
import { Rajdhani, Ubuntu_Mono, Dosis } from '@next/font/google';
import clsx from 'clsx';
import 'styles/globals.scss';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700']
});
const ubuntu = Ubuntu_Mono({
  subsets: ['latin'],
  weight: ['400']
});
const dosis = Dosis({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
        :root {
          --rajdhani-font: ${rajdhani.style.fontFamily};
          --ubuntu-font: ${ubuntu.style.fontFamily};
          --dosis-font: ${dosis.style.fontFamily};
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
