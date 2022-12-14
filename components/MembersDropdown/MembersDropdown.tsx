import { KeyboardEventHandler, MouseEventHandler, ReactElement } from 'react';

import { Dropdown } from 'components/ui-kit/Dropdown';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';
import { KeyringPair } from '@polkadot/keyring/types';

import styles from './MembersDropdown.module.scss';

export interface MembersDropdownProps {
  accounts?: KeyringPair[];
  children: ReactElement;
  handleOnClick: MouseEventHandler<HTMLUListElement>;
  handleOnKeyDown: KeyboardEventHandler<HTMLUListElement>;
  index?: number;
}

export function MembersDropdown({
  accounts,
  index,
  handleOnClick,
  handleOnKeyDown,
  children
}: MembersDropdownProps) {
  if (!accounts) {
    return null;
  }

  return (
    <Dropdown
      fullWidth
      dropdownItems={
        <Card dropdown className={styles['member-dropdown-card']}>
          <ul
            className={styles['member-dropdown-ul']}
            onClick={handleOnClick}
            onKeyDown={handleOnKeyDown}
            role="presentation"
          >
            {accounts.map((x) => (
              <li key={x.address}>
                <Button
                  variant="text"
                  fullWidth
                  className={styles['member-dropdown-button']}
                  size="sm"
                  data-address={x.address}
                  data-index={index}
                >
                  <span className={styles['member-dropdown-button-span']}>
                    <Icon name="user-profile" size="sm" />
                    <Typography variant="title4">
                      {x.meta.name as string}
                    </Typography>
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      }
    >
      {children}
    </Dropdown>
  );
}
