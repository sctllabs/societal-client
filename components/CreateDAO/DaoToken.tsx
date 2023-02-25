import { ChangeEventHandler, Dispatch, SetStateAction } from 'react';
import * as Label from '@radix-ui/react-label';
import { RadioGroup, RadioGroupItem } from 'components/ui-kit/Radio';
import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';

import { DaoTokenState, TokenType } from './types';

import styles from './CreateDAO.module.scss';

enum InputName {
  TOKEN_QUANTITY = 'quantity',
  TOKEN_NAME = 'name',
  TOKEN_SYMBOL = 'symbol',
  TOKEN_TYPE = 'type',
  TOKEN_ADDRESS = 'address'
}

enum InputLabel {
  TOKEN_QUANTITY = 'Quantity of Tokens',
  TOKEN_NAME = 'Token Name',
  TOKEN_SYMBOL = 'Token Symbol',
  TOKEN_ADDRESS = 'ETH Token Address'
}

type DaoTokenProps = {
  state: any;
  setState: Dispatch<SetStateAction<DaoTokenState>>;
};

export function DaoToken({ state, setState }: DaoTokenProps) {
  const onTokenTypeValueChange = (_tokenType: TokenType) =>
    setState((prevState) => ({ ...prevState, type: _tokenType }));

  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name;
    const targetValue = target.value;

    setState((prevState) => ({
      ...prevState,
      [targetName]:
        targetName === InputName.TOKEN_QUANTITY
          ? targetValue.replace(/[^0-9]/g, '')
          : targetValue
    }));
  };

  return (
    <>
      <div>
        <Typography variant="h3">Select Governance Token</Typography>
        <Typography variant="body1">
          Choose the type of your Governance token.
        </Typography>

        <RadioGroup
          name={InputName.TOKEN_TYPE}
          onValueChange={onTokenTypeValueChange}
          defaultValue={TokenType.FUNGIBLE_TOKEN}
          className={styles['token-type-radio-group']}
        >
          {Object.values(TokenType).map((_tokenType) => (
            <div key={_tokenType} className={styles['token-type-radio']}>
              <RadioGroupItem value={_tokenType} id={_tokenType} />
              <Label.Root htmlFor={_tokenType}>
                <Typography variant="body2">{_tokenType}</Typography>
              </Label.Root>
            </div>
          ))}
        </RadioGroup>
      </div>
      {state.type === TokenType.FUNGIBLE_TOKEN ? (
        <div className={styles['quantity-of-tokens']}>
          <Typography variant="h3">Select the Quantity of Tokens</Typography>
          <Typography variant="body1">
            Specify the number of tokens, the maximum amount is 1 billion.
          </Typography>

          <div className={styles['quantity-of-tokens-inputs']}>
            <Input
              name={InputName.TOKEN_QUANTITY}
              label={InputLabel.TOKEN_QUANTITY}
              value={state.quantity}
              onChange={onInputChange}
              type="tel"
              required
            />
          </div>
        </div>
      ) : (
        <div className={styles['quantity-of-tokens']}>
          <Typography variant="h3">ETH Token Address</Typography>
          <Typography variant="body1">Specify ETH Token Address.</Typography>

          <div className={styles['quantity-of-tokens-inputs']}>
            <Input
              name={InputName.TOKEN_ADDRESS}
              label={InputLabel.TOKEN_ADDRESS}
              value={state.address}
              onChange={onInputChange}
              required
            />
          </div>
        </div>
      )}

      {state.type === TokenType.FUNGIBLE_TOKEN && (
        <div className={styles['token-info']}>
          <Typography variant="h3">Select Token Info</Typography>
          <Typography variant="body1">
            Choose a name and symbol for the Governance token.
          </Typography>

          <div className={styles['token-info-inputs']}>
            <Input
              name={InputName.TOKEN_NAME}
              label={InputLabel.TOKEN_NAME}
              value={state.name}
              onChange={onInputChange}
              required
            />
            <Input
              name={InputName.TOKEN_SYMBOL}
              label={InputLabel.TOKEN_SYMBOL}
              value={state.symbol}
              onChange={onInputChange}
              required
            />
          </div>
        </div>
      )}
    </>
  );
}
