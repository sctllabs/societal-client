import { ChangeEventHandler } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { tokenNameAtom, tokenTickerAtom, tokenTypeAtom } from 'store/createDao';

import { TokenType } from 'constants/token';
import { UNEXPECTED_FIELD_VALUE } from 'constants/errors';

import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';

import styles from './CreateDao.module.scss';

enum InputLabel {
  TOKEN_NAME = 'Token Name',
  TOKEN_TICKER = 'Token Ticker'
}

enum InputName {
  TOKEN_NAME = 'tokenName',
  TOKEN_TICKER = 'tokenTicker'
}

export function TokenInfo() {
  const tokenType = useAtomValue(tokenTypeAtom);
  const [tokenName, setTokenName] = useAtom(tokenNameAtom);
  const [tokenTicker, setTokenTicker] = useAtom(tokenTickerAtom);

  const onChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;

    switch (name) {
      case InputName.TOKEN_NAME: {
        setTokenName(value);
        break;
      }
      case InputName.TOKEN_TICKER: {
        setTokenTicker(value);
        break;
      }
      default: {
        throw new Error(UNEXPECTED_FIELD_VALUE);
      }
    }
  };

  if (tokenType === TokenType.ETH_TOKEN) {
    return null;
  }

  return (
    <div className={styles.section}>
      <Typography variant="h3">Token Info</Typography>
      <Typography variant="body1">
        Enter a name and ticker for the Governance token.
      </Typography>

      <div className={styles['double-input-container']}>
        <Input
          name={InputName.TOKEN_NAME}
          label={InputLabel.TOKEN_NAME}
          value={tokenName}
          onChange={onChange}
          required
        />

        <Input
          name={InputName.TOKEN_TICKER}
          label={InputLabel.TOKEN_TICKER}
          value={tokenTicker}
          onChange={onChange}
          required
        />
      </div>
    </div>
  );
}
