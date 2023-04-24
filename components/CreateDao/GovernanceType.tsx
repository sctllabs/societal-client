import { useAtom, useAtomValue } from 'jotai';
import { governanceAtom, tokenTypeAtom } from 'store/createDao';

import { GovernanceEth, GovernanceFungibleToken } from 'constants/governance';
import { TokenType } from 'constants/token';
import { UNEXPECTED_TOKEN_VALUE } from 'constants/errors';

import * as Label from '@radix-ui/react-label';
import { Typography } from 'components/ui-kit/Typography';
import { Checkbox } from 'components/ui-kit/Checkbox';

import styles from './CreateDao.module.scss';

export function GovernanceType() {
  const tokenType = useAtomValue(tokenTypeAtom);
  const [governance, setGovernance] = useAtom(governanceAtom);

  const onCheckedChange = (value: boolean) => {
    switch (tokenType) {
      case TokenType.FUNGIBLE_TOKEN: {
        setGovernance(
          value
            ? [
                GovernanceFungibleToken.GeneralCouncilAndTechnicalCommittee,
                GovernanceFungibleToken.GovernanceV1
              ]
            : [GovernanceFungibleToken.GeneralCouncilAndTechnicalCommittee]
        );
        break;
      }
      case TokenType.ETH_TOKEN: {
        setGovernance(
          value
            ? [
                GovernanceEth.GeneralCouncil,
                GovernanceEth.OwnershipWeightedVoting
              ]
            : [GovernanceEth.GeneralCouncil]
        );
        break;
      }
      default: {
        throw new Error(UNEXPECTED_TOKEN_VALUE);
      }
    }
  };

  return (
    <div className={styles.section}>
      <Typography variant="h3">Governance Token</Typography>
      <Typography variant="body1">
        Choose the type of your Governance token.
      </Typography>
      <div className={styles['radio-checkbox-group']}>
        {Object.values(
          tokenType === TokenType.FUNGIBLE_TOKEN
            ? GovernanceFungibleToken
            : GovernanceEth
        ).map((_governance) => {
          const checked = governance.includes(_governance);
          let disabled: boolean;

          switch (tokenType) {
            case TokenType.FUNGIBLE_TOKEN: {
              disabled =
                _governance ===
                GovernanceFungibleToken.GeneralCouncilAndTechnicalCommittee;
              break;
            }
            case TokenType.ETH_TOKEN: {
              disabled = _governance === GovernanceEth.GeneralCouncil;
              break;
            }
            default: {
              throw new Error(UNEXPECTED_TOKEN_VALUE);
            }
          }

          return (
            <div key={_governance} className={styles['radio-checkbox']}>
              <Checkbox
                id={_governance}
                onCheckedChange={onCheckedChange}
                checked={checked}
                disabled={disabled}
              />
              <Label.Root>
                <Typography variant="title4">{_governance}</Typography>
              </Label.Root>
            </div>
          );
        })}
      </div>
    </div>
  );
}
