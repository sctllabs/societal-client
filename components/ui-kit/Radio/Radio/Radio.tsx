import {
  ChangeEventHandler,
  forwardRef,
  InputHTMLAttributes,
  useId,
  useState
} from 'react';
import clsx from 'clsx';

import { useRadioContext } from 'hooks';

import styles from './Radio.module.scss';

export interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  className?: string;
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    className,
    value,
    color,
    label,
    name: nameProps,
    onChange: onChangeProps,
    ...otherProps
  }: RadioProps,
  ref
) {
  const { state, onChange, name: radioGroupName } = useRadioContext();
  const [clicked, setClicked] = useState(false);
  const id = useId();

  const checked = value === state;

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
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
    <div className={clsx(styles.root)}>
      <input
        id={id}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleOnMouseLeave}
        value={value}
        checked={checked}
        name={name}
        type="radio"
        className={clsx(
          styles.radio,
          {
            [styles.clicked]: clicked
          },
          className
        )}
        onChange={handleInputChange}
        ref={ref}
        {...otherProps}
      />
      <label htmlFor={id} className={clsx(styles.label)}>
        {label}
      </label>
    </div>
  );
});
