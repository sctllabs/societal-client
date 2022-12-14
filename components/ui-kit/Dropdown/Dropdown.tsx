import React, { useState, useCallback, useEffect } from 'react';
import { usePopper } from 'react-popper';
import clsx from 'clsx';

import { useIsomorphicLayoutEffect } from 'hooks';
import { handleEnterKeyPress, handleEscKeyPress } from 'utils';

import styles from './Dropdown.module.scss';

export interface DropdownProps {
  dropdownItems: React.ReactNode;
  children: React.ReactElement;
  className?: string;
}

export function Dropdown({
  children,
  className,
  dropdownItems
}: DropdownProps) {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null
  );
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const [show, setShow] = useState(false);
  const {
    styles: popperStyles,
    attributes,
    update
  } = usePopper(referenceElement, popperElement, {
    modifiers: [
      {
        name: 'offset',
        options: { offset: [0, 10] }
      },
      {
        name: 'preventOverflow',
        options: { altAxis: true, padding: 20 }
      }
    ],
    placement: 'bottom'
  });

  const child = React.Children.only(children);

  useIsomorphicLayoutEffect(() => {
    if (show && update) {
      update();
    }
  }, [show]);

  const toggleDropdown = useCallback(() => {
    const { onClick } = child.props;

    setShow((state) => !state);
    if (onClick) {
      onClick();
    }
  }, [child.props]);

  const hideDropdown = useCallback(() => {
    setShow(false);
  }, []);

  useEffect(() => {
    if (!show) return undefined;

    const handleClick = (e: Event) => {
      if (
        popperElement &&
        referenceElement &&
        !referenceElement.contains(e.target as Node)
      ) {
        setTimeout(() => {
          hideDropdown();
        }, 0);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      handleEnterKeyPress(handleClick.bind(null, e))(e);
      handleEscKeyPress(hideDropdown)(e);
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [popperElement, referenceElement, show, hideDropdown]);

  return (
    <>
      {React.cloneElement<React.HTMLProps<HTMLElement>>(child, {
        ref: setReferenceElement,
        onClick: toggleDropdown,
        onKeyDown: handleEnterKeyPress(toggleDropdown)
      })}
      {show && (
        <div
          ref={setPopperElement}
          style={popperStyles.popper}
          className={clsx(styles.root, { [styles.show]: show }, className)}
          {...attributes.popper}
        >
          {dropdownItems}
        </div>
      )}
    </>
  );
}
