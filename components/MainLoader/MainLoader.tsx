import { CSSProperties, HTMLAttributes, useRef } from 'react';
import { Transition } from 'react-transition-group';
import Image from 'next/image';

import { useAtomValue } from 'jotai';
import { statesLoadingAtom } from 'store/loader';

import styles from './MainLoader.module.scss';

const transitionStyles: Record<string, CSSProperties> = {
  entering: { opacity: 1 },
  entered: { opacity: 1 },
  exiting: { opacity: 0 },
  exited: { opacity: 0 }
};

export interface MainLoaderProps extends HTMLAttributes<HTMLDivElement> {}

export function MainLoader({ ...props }: MainLoaderProps) {
  const ref = useRef(null);
  const loading = useAtomValue(statesLoadingAtom);

  return (
    <Transition nodeRef={ref} in={loading} timeout={300} unmountOnExit>
      {(state) => (
        <div
          ref={ref}
          className={styles.root}
          {...props}
          style={{
            ...transitionStyles[state]
          }}
        >
          <div className={styles.logo}>
            <Image src="/logo/societal-primary.svg" alt="societal logo" fill />
          </div>
          <div className={styles.loader}>
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
      )}
    </Transition>
  );
}
