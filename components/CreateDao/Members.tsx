import { ChangeEventHandler, MouseEventHandler } from 'react';

import { useAtom, useAtomValue } from 'jotai';
import { accountsAtom } from 'store/account';
import { membersAtom } from 'store/createDao';

import { MembersDropdown } from 'components/MembersDropdown';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Input } from 'components/ui-kit/Input';
import { Icon } from 'components/ui-kit/Icon';

import styles from './CreateDao.module.scss';

enum InputLabel {
  ADDRESS = 'Add New Address'
}

export function Members() {
  const accounts = useAtomValue(accountsAtom);
  const [members, setMembers] = useAtom(membersAtom);

  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetValue = target.value;

    const dataAddressString = target.getAttribute('data-address-index');

    if (dataAddressString === null) {
      return;
    }
    const dataAddressIndex = parseInt(dataAddressString, 10);
    setMembers((prevState) =>
      prevState.map((x, index) =>
        dataAddressIndex === index ? targetValue : x
      )
    );
  };

  const onMemberValueChange = (address: string, index?: string | null) => {
    if (typeof index !== 'string') {
      return;
    }
    const addressIndex = parseInt(index, 10);

    setMembers((prevState) =>
      prevState.map((_address, idx) =>
        idx === addressIndex ? address : _address
      )
    );
  };

  const handleAddAddressClick: MouseEventHandler = () =>
    setMembers((prevState) => [...prevState, '']);

  const handleRemoveAddressClick: MouseEventHandler = (e) => {
    const dataAddressIndex = (e.target as HTMLButtonElement).getAttribute(
      'data-address-index'
    );
    if (dataAddressIndex === null) {
      return;
    }

    const addressIndex = parseInt(dataAddressIndex, 10);
    setMembers((prevState) =>
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
      <div className={styles.inputs}>
        {members.map((x, index) => {
          const lastItem =
            index === members.length - 1 && accounts?.length !== members.length;
          const key = `address-${index}`;

          return (
            <MembersDropdown
              accounts={accounts?.filter(
                (_account) => !members.includes(_account.address)
              )}
              key={key}
              onValueChange={onMemberValueChange}
              index={index}
            >
              <Input
                label={InputLabel.ADDRESS}
                onChange={onInputChange}
                data-address-index={index}
                value={
                  (accounts?.find(
                    (_account) => _account.address === members[index]
                  )?.meta.name as string) || members[index]
                }
                autoComplete="off"
                required
                endAdornment={
                  <span className={styles['input-button-group']}>
                    {(members[index] || !lastItem) && (
                      <Button
                        data-address-index={index}
                        variant="ghost"
                        className={styles['input-button']}
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
                        className={styles['input-button']}
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
