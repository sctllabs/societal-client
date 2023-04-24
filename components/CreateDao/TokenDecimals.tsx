import { ChangeEventHandler } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { tokenDecimalsAtom, tokenTypeAtom } from 'store/createDao';
import { TokenType } from 'constants/token';

import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';

import styles from './CreateDao.module.scss';

enum InputLabel {
  TOKEN_DECIMALS = 'Token Decimals'
}

export function TokenDecimals() {
  const tokenType = useAtomValue(tokenTypeAtom);
  const [tokenDecimals, setTokenDecimals] = useAtom(tokenDecimalsAtom);

  const onChange: ChangeEventHandler = (e) =>
    setTokenDecimals(
      parseInt((e.target as HTMLInputElement).value.replace(/[^0-9]/g, ''), 10)
    );

  if (tokenType === TokenType.ETH_TOKEN) {
    return null;
  }

  return (
    <div className={styles.section}>
      <Typography variant="h3">Token Decimals</Typography>
      <Typography variant="body1">
        Specify how many decimal places a token has.
      </Typography>

      <div className={styles['input-half-width']}>
        <Input
          label={InputLabel.TOKEN_DECIMALS}
          value={tokenDecimals}
          onChange={onChange}
          type="tel"
          required
        />
      </div>
    </div>
  );
}
