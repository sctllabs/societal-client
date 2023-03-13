import {
  ChangeEventHandler,
  Dispatch,
  MouseEventHandler,
  SetStateAction
} from 'react';

import { useAtomValue } from 'jotai';
import { accountsAtom } from 'store/account';

import { MembersDropdown } from 'components/MembersDropdown';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Input } from 'components/ui-kit/Input';
import { Icon } from 'components/ui-kit/Icon';

import styles from './CreateDAO.module.scss';
import type { DaoMembersState } from './types';

enum InputName {
  ADDRESSES = 'addresses',
  ROLE = 'role'
}

enum InputLabel {
  ADDRESS = 'New Member',
  ROLE = 'Role of Members'
}

type DaoMembersProps = {
  state: DaoMembersState;
  setState: Dispatch<SetStateAction<DaoMembersState>>;
};

export function DaoMembers({ state, setState }: DaoMembersProps) {
  const accounts = useAtomValue(accountsAtom);

  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name;
    const targetValue = target.value;

    if (targetName === InputName.ADDRESSES) {
      const dataAddressIndex = target.getAttribute('data-address-index');
      setState((prevState) => ({
        ...prevState,
        addresses: prevState.addresses.map((x, index) =>
          dataAddressIndex && parseInt(dataAddressIndex, 10) === index
            ? targetValue
            : x
        )
      }));
      return;
    }

    setState((prevState) => ({
      ...prevState,
      [targetName]: targetValue
    }));
  };

  const onMemberValueChange = (address: string, index?: string | null) => {
    if (typeof index !== 'string') {
      return;
    }
    const addressIndex = parseInt(index, 10);

    setState((prevState) => ({
      ...prevState,
      addresses: prevState.addresses.map((_address, idx) =>
        idx === addressIndex ? address : _address
      )
    }));
  };

  const handleAddAddressClick: MouseEventHandler = () =>
    setState((prevState) => ({
      ...prevState,
      addresses: [...prevState.addresses, '']
    }));

  const handleRemoveAddressClick: MouseEventHandler = (e) => {
    const target = e.target as HTMLButtonElement;
    const dataAddressIndex = target.getAttribute('data-address-index');
    if (!dataAddressIndex) {
      return;
    }

    const addressIndex = parseInt(dataAddressIndex, 10);
    setState((prevState) => ({
      ...prevState,
      addresses:
        prevState.addresses.length === 1
          ? ['']
          : prevState.addresses.filter((_, index) => index !== addressIndex)
    }));
  };

  return (
    <div className={styles.members}>
      <Typography variant="h3">Members</Typography>
      <Typography variant="body1">
        Your Governance Solution comes with the following groups.
      </Typography>
      <div className={styles['members-inputs']}>
        <Input
          readOnly
          name={InputName.ROLE}
          label={InputLabel.ROLE}
          value={state.role}
          classNames={{
            root: styles['members-inputs-role-root'],
            input: styles['members-inputs-role-input']
          }}
          disabled
          required
        />

        <div className={styles['members-addresses']}>
          {state.addresses.map((x, index) => {
            const lastItem =
              index === state.addresses.length - 1 &&
              accounts?.length !== state.addresses.length;
            const key = `address-${index}`;

            return (
              <MembersDropdown
                accounts={accounts?.filter(
                  (_account) => !state.addresses.includes(_account.address)
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
                      (_account) => _account.address === state.addresses[index]
                    )?.meta.name as string) || state.addresses[index]
                  }
                  autoComplete="off"
                  required
                  endAdornment={
                    <span className={styles['members-button-group']}>
                      {(state.addresses[index] || !lastItem) && (
                        <Button
                          data-address-index={index}
                          variant="ghost"
                          className={styles['members-add-button']}
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
                          className={styles['members-add-button']}
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
    </div>
  );
}
