import { ChangeEventHandler, MouseEventHandler } from 'react';

import { SetStateAction } from 'jotai';

import { isValidUrl } from 'utils/isValidUrl';
import { getLinkIcon } from 'utils/getLinkIcon';

import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Input } from 'components/ui-kit/Input';
import { Typography } from 'components/ui-kit/Typography';

import styles from './CreateDao.module.scss';

type LinkInputProps = {
  title: string;
  subtitle: string;
  label: string;
  state: string[];
  setState: (update: SetStateAction<string[]>) => void;
  autoFocus: boolean;
};

export function LinkInput({
  title,
  subtitle,
  label,
  state,
  setState,
  autoFocus
}: LinkInputProps) {
  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetValue = target.value;

    const dataAddressString = target.getAttribute('data-address-index');

    if (dataAddressString === null) {
      return;
    }
    const dataAddressIndex = parseInt(dataAddressString, 10);

    setState((prevState) =>
      prevState.map((x, index) =>
        dataAddressIndex === index ? targetValue : x
      )
    );
  };

  const handleAddLinkClick: MouseEventHandler = () =>
    setState((prevState) => [...prevState, '']);

  const handleRemoveLinkClick: MouseEventHandler = (e) => {
    const target = e.target as HTMLButtonElement;
    const dataAddressIndex = target.getAttribute('data-address-index');
    if (!dataAddressIndex) {
      return;
    }

    const linkIndex = parseInt(dataAddressIndex, 10);

    setState((prevState) =>
      prevState.length === 1
        ? ['']
        : prevState.filter((_, index) => index !== linkIndex)
    );
  };

  return (
    <div className={styles.section}>
      <span className={styles['title-optional-container']}>
        <Typography variant="h3">{title}</Typography>
        <Typography variant="paragraph2">(optional)</Typography>
      </span>
      <Typography variant="body1">{subtitle}</Typography>

      <div className={styles.inputs}>
        {state.map((_link, index) => {
          const lastItem = index === state.length - 1;
          const key = `link-${index}`;
          const error = _link.length > 0 && !isValidUrl(_link);

          return (
            <Input
              key={key}
              label={label}
              onChange={onInputChange}
              data-address-index={index}
              value={_link}
              error={error}
              autoFocus={autoFocus}
              startAdornment={
                _link && <Icon name={getLinkIcon(_link)} size="sm" />
              }
              endAdornment={
                <span>
                  {(state[index] || !lastItem) && (
                    <Button
                      data-address-index={index}
                      variant="ghost"
                      className={styles['input-button']}
                      onClick={handleRemoveLinkClick}
                      size="sm"
                    >
                      <Icon name="trash" size="sm" />
                    </Button>
                  )}
                  {lastItem && (
                    <Button
                      data-address-index={index}
                      variant="ghost"
                      className={styles['input-button']}
                      onClick={handleAddLinkClick}
                      size="sm"
                    >
                      <Icon name="add" size="sm" />
                    </Button>
                  )}
                </span>
              }
            />
          );
        })}
      </div>
    </div>
  );
}
