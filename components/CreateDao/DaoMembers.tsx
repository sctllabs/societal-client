import { ChangeEventHandler, MouseEventHandler } from 'react';

import { useAtom, useAtomValue } from 'jotai';
import { daoMembersAtom } from 'store/dao';
import { accountsAtom } from 'store/account';

import { MembersDropdown } from 'components/MembersDropdown';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Input } from 'components/ui-kit/Input';
import { Icon } from 'components/ui-kit/Icon';

import styles from './CreateDao.module.scss';

enum InputName {
  ADDRESSES = 'addresses'
}

enum InputLabel {
  ADDRESS = 'Add New Address'
}

export function DaoMembers() {
  const accounts = useAtomValue(accountsAtom);
  const [daoMembers, setDaoMembers] = useAtom(daoMembersAtom);

  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetValue = target.value;

    const dataAddressIndex = target.getAttribute('data-address-index');
    setDaoMembers((prevState) =>
      prevState.map((x, index) =>
        dataAddressIndex && parseInt(dataAddressIndex, 10) === index
          ? targetValue
          : x
      )
    );
  };

  const onMemberValueChange = (address: string, index?: string | null) => {
    if (typeof index !== 'string') {
      return;
    }
    const addressIndex = parseInt(index, 10);

    setDaoMembers((prevState) =>
      prevState.map((_address, idx) =>
        idx === addressIndex ? address : _address
      )
    );
  };

  const handleAddAddressClick: MouseEventHandler = () =>
    setDaoMembers((prevState) => [...prevState, '']);

  const handleRemoveAddressClick: MouseEventHandler = (e) => {
    const target = e.target as HTMLButtonElement;
    const dataAddressIndex = target.getAttribute('data-address-index');
    if (!dataAddressIndex) {
      return;
    }

    const addressIndex = parseInt(dataAddressIndex, 10);
    setDaoMembers((prevState) =>
      prevState.length === 1
        ? ['']
        : prevState.filter((_, index) => index !== addressIndex)
    );
  };

  return (
    <div className={styles.members}>
      <Typography variant="h3">Admins</Typography>
      <Typography variant="body1">
        Add your DAO admins now or you can do it later in your DAO settings.
      </Typography>
      <div className={styles['members-addresses']}>
        {daoMembers.map((x, index) => {
          const lastItem =
            index === daoMembers.length - 1 &&
            accounts?.length !== daoMembers.length;
          const key = `address-${index}`;

          return (
            <MembersDropdown
              accounts={accounts?.filter(
                (_account) => !daoMembers.includes(_account.address)
              )}
              key={key}
              onValueChange={onMemberValueChange}
              index={index}
            >
              <Input
                name={InputName.ADDRESSES}
                label={InputLabel.ADDRESS}
                onChange={onInputChange}
                data-address-index={index}
                value={
                  (accounts?.find(
                    (_account) => _account.address === daoMembers[index]
                  )?.meta.name as string) || daoMembers[index]
                }
                autoComplete="off"
                required
                endAdornment={
                  <span className={styles['members-button-group']}>
                    {(daoMembers[index] || !lastItem) && (
                      <Button
                        data-address-index={index}
                        variant="ghost"
                        className={styles['members-button']}
                        onClick={handleRemoveAddressClick}
                        size="sm"
                      >
                        <Icon name="close" size="sm" />
                      </Button>
                    )}
                    {lastItem && (
                      <Button
                        data-address-index={index}
                        variant="ghost"
                        className={styles['members-button']}
                        onClick={handleAddAddressClick}
                        size="sm"
                      >
                        <Icon name="add" size="sm" />
                      </Button>
                    )}
                  </span>
                }
              />
            </MembersDropdown>
          );
        })}
      </div>
    </div>
  );
}
