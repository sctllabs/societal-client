import Image from 'next/image';
import { KeyboardEventHandler, MouseEventHandler, ReactElement } from 'react';

import { wallets } from 'constants/wallets';

import { Dropdown } from 'components/ui-kit/Dropdown';
import { Button } from 'components/ui-kit/Button';
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
            {accounts.map((_account) => {
              const currentWallet =
                wallets.find(
                  (_wallet) => _wallet.source === _account.meta.source
                ) ??
                wallets.find((_wallet) => _wallet.source === 'development')!;

              return (
                <li key={_account.address}>
                  <Button
                    variant="text"
                    fullWidth
                    className={styles['member-dropdown-button']}
                    size="sm"
                    data-address={_account.address}
                    data-index={index}
                  >
                    <span className={styles['member-dropdown-button-span']}>
                      <Image
                        src={currentWallet.icon}
                        alt={currentWallet.name}
                        width={24}
                        height={24}
                      />
                      <Typography variant="title4">
                        {_account.meta.name as string}
                      </Typography>
                    </span>
                  </Button>
                </li>
              );
            })}
          </ul>
        </Card>
      }
    >
      {children}
    </Dropdown>
  );
}
