import { ChangeEventHandler, useState } from 'react';
import { Input } from 'components/ui-kit/Input';
import { Icon } from 'components/ui-kit/Icon';

export function Search() {
  const [value, setValue] = useState('');

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
