import { ChangeEventHandler } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { tokenQuantityAtom, tokenTypeAtom } from 'store/createDao';
import { TokenType } from 'constants/token';

import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';

import styles from './CreateDao.module.scss';

enum InputLabel {
  TOKEN_QUANTITY = 'Quantity of Tokens'
}

export function TokenQuantity() {
  const tokenType = useAtomValue(tokenTypeAtom);
  const [tokenQuantity, setTokenQuantity] = useAtom(tokenQuantityAtom);

  const onChange: ChangeEventHandler = (e) =>
    setTokenQuantity(
      (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '')
    );

  if (tokenType === TokenType.ETH_TOKEN) {
    return null;
  }

  return (
    <div className={styles.section}>
      <Typography variant="h3">Token Ticker</Typography>
      <Typography variant="body1">
        Enter a name for your Governance token.
      </Typography>

      <div className={styles['input-half-width']}>
        <Input
          label={InputLabel.TOKEN_QUANTITY}
          value={tokenQuantity}
          onChange={onChange}
          type="tel"
          required
        />
      </div>
    </div>
  );
}
