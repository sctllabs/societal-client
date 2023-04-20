import { ChangeEventHandler } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { tokenTickerAtom, tokenTypeAtom } from 'store/createDao';

import { TokenType } from 'constants/token';

import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';

import styles from './CreateDao.module.scss';

enum InputLabel {
  TOKEN_TICKER = 'Token Ticker'
}

export function TokenTicker() {
  const tokenType = useAtomValue(tokenTypeAtom);
  const [tokenTicker, setTokenTicker] = useAtom(tokenTickerAtom);

  const onChange: ChangeEventHandler = (e) =>
    setTokenTicker((e.target as HTMLInputElement).value);

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
          label={InputLabel.TOKEN_TICKER}
          value={tokenTicker}
          onChange={onChange}
          required
        />
      </div>
    </div>
  );
}
