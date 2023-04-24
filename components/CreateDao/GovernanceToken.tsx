import { ChangeEventHandler } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
  ethTokenAddressAtom,
  governanceAtom,
  tokenTypeAtom
} from 'store/createDao';
import { isEthereumAddress } from '@polkadot/util-crypto';

import { TokenType } from 'constants/token';
import { GovernanceEth, GovernanceFungibleToken } from 'constants/governance';
import { UNEXPECTED_TOKEN_VALUE } from 'constants/errors';

import * as Label from '@radix-ui/react-label';
import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';
import { RadioGroup, RadioGroupItem } from 'components/ui-kit/Radio';

import styles from './CreateDao.module.scss';

enum InputLabel {
  TOKEN_ADDRESS = 'ETH Token Address'
}

export function GovernanceToken() {
  const [tokenType, setTokenType] = useAtom(tokenTypeAtom);
  const [ethTokenAddress, setEthTokenAddress] = useAtom(ethTokenAddressAtom);
  const setGovernance = useSetAtom(governanceAtom);

  const onTokenTypeValueChange = (_tokenType: TokenType) => {
    switch (_tokenType) {
      case TokenType.FUNGIBLE_TOKEN: {
        setGovernance([
          GovernanceFungibleToken.GeneralCouncilAndTechnicalCommittee
        ]);
        break;
      }
      case TokenType.ETH_TOKEN: {
        setGovernance([GovernanceEth.GeneralCouncil]);
        break;
      }
      default: {
        throw new Error(UNEXPECTED_TOKEN_VALUE);
      }
    }
    setTokenType(_tokenType);
  };

  const onChange: ChangeEventHandler = (e) =>
    setEthTokenAddress((e.target as HTMLInputElement).value);

  const error =
    ethTokenAddress.length > 0 && !isEthereumAddress(ethTokenAddress);

  return (
    <div className={styles.section}>
      <Typography variant="h3">Governance Token</Typography>
      <Typography variant="body1">
        Choose the type of your Governance token.
      </Typography>

      <RadioGroup
        onValueChange={onTokenTypeValueChange}
        defaultValue={tokenType}
        className={styles['radio-checkbox-group']}
      >
        {Object.values(TokenType).map((_tokenType, index) => (
          <div key={_tokenType} className={styles['radio-checkbox']}>
            <RadioGroupItem
              autoFocus={index === 0}
              value={_tokenType}
              id={_tokenType}
            />
            <Label.Root htmlFor={_tokenType}>
              <Typography variant="title4">{_tokenType}</Typography>
            </Label.Root>
          </div>
        ))}
      </RadioGroup>
      {tokenType === TokenType.ETH_TOKEN && (
        <div className={styles['eth-token-address']}>
          <Input
            label={InputLabel.TOKEN_ADDRESS}
            value={ethTokenAddress}
            onChange={onChange}
            error={error}
            required
          />
        </div>
      )}
    </div>
  );
}
