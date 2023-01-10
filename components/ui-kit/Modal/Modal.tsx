import { useEffect, useRef, MouseEvent, CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Transition } from 'react-transition-group';
import clsx from 'clsx';

import styles from './Modal.module.scss';

export interface ModalProps {
  open: boolean;
  container?: Element;
  children?: ReactNode;
  onClose?: () => void;
  closeable?: boolean;
}

const transitionStyles: Record<string, CSSProperties> = {
  entering: { opacity: 0 },
  entered: { opacity: 1 },
  exiting: { opacity: 1 },
  exited: { opacity: 0 }
};

export function Modal({
  open,
  onClose,
  container,
  closeable = false,
  children
}: ModalProps) {
  const mountNode = useRef<Element | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const elementOnMouseDown = useRef<HTMLElement | null>(null);

  useEffect(() => {
    mountNode.current = container ?? document.body;
  }, [container]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeable && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, closeable]);

  const handleMouseDown = (e: MouseEvent) => {
    elementOnMouseDown.current = e.target as HTMLElement;
  };

  const handleBackgroundClick = (e: MouseEvent<HTMLElement>) => {
    if (elementOnMouseDown.current === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    mountNode.current &&
    createPortal(
      <Transition nodeRef={ref} in={open} timeout={100} unmountOnExit>
        {(state) => (
          <div
            ref={ref}
            role="presentation"
            onMouseDown={handleMouseDown}
            onClickCapture={handleBackgroundClick}
            className={clsx(styles.root)}
            style={{
              ...transitionStyles[state]
            }}
          >
            <div aria-hidden className={styles.backdrop} />
            <div className={styles.content}>{children}</div>
          </div>
        )}
      </Transition>,
      document.body
    )
  );
}
