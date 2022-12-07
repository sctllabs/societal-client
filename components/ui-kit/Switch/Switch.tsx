import { forwardRef, ChangeEvent, InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import { useControlled } from 'hooks/components';

import styles from './Switch.module.scss';

export const Switch = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Switch(
  {
    checked: checkedProp,
    onChange,
    color,
    defaultChecked,
    className,
    ...otherProps
  },
  ref
) {
  const [checked, setCheckedState] = useControlled({
    controlled: checkedProp,
    default: Boolean(defaultChecked),
    name: 'SwitchBase',
    state: 'checked'
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.nativeEvent.defaultPrevented) {
      return;
    }

    setCheckedState(event.target.checked);

    if (onChange) {
      onChange(event);
    }
  };

  return (
    <input
      className={clsx(styles.root, className)}
      checked={checked}
      onChange={handleInputChange}
      type="checkbox"
      role="switch"
      aria-checked={checked}
      ref={ref}
      {...otherProps}
    />
  );
});

export default Switch;
