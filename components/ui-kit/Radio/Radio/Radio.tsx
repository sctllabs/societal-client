import { ChangeEvent, forwardRef, InputHTMLAttributes, useState } from 'react';
import clsx from 'clsx';

import { useRadioContext } from 'hooks/components';

import styles from './Radio.module.scss';

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  className?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    className,
    value,
    color,
    name: nameProps,
    onChange: onChangeProps,
    ...otherProps
  }: RadioProps,
  ref
) {
  const { state, onChange, name: radioGroupName } = useRadioContext();
  const [clicked, setClicked] = useState(false);

  const checked = value === state;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    if (onChangeProps) {
      onChangeProps(e);
    }
  };

  const name = nameProps ?? radioGroupName;

  const handleMouseDown = () => setClicked(true);
  const handleMouseUp = () => setClicked(false);
  const handleOnMouseLeave = () => clicked && setClicked(false);

  return (
    <input
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleOnMouseLeave}
      value={value}
      checked={checked}
      name={name}
      type="radio"
      className={clsx(
        styles.root,
        {
          [styles.clicked]: clicked
        },
        className
      )}
      onChange={handleInputChange}
      ref={ref}
      {...otherProps}
    />
  );
});
