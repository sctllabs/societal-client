import { ChangeEventHandler, useState } from 'react';

import { useAtomValue } from 'jotai';
import { substrateAccountAtom } from 'store/account';

import { Input } from 'components/ui-kit/Input';
import { Icon } from 'components/ui-kit/Icon';

export function Search() {
  const [value, setValue] = useState('');
  const currentAccount = useAtomValue(substrateAccountAtom);

  if (!currentAccount) {
    return null;
  }

  const handleOnChange: ChangeEventHandler<HTMLInputElement> = (e) =>
    setValue(e.target.value);

  return (
    <Input
      variant="outlined"
      placeholder="Search"
      value={value}
      onChange={handleOnChange}
      disabled
      startAdornment={<Icon name="search" placeholder="Search" />}
    />
  );
}
