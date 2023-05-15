import { useAtomValue } from 'jotai';
import Link from 'next/link';

import { tokenAtom, tokenLoadingAtom } from 'store/token';
import { appConfig } from 'config';
import { formatBalance } from '@polkadot/util';

import { Typography } from 'components/ui-kit/Typography';
import { Card } from 'components/ui-kit/Card';
import { Chip } from 'components/ui-kit/Chip';
import { Icon } from 'components/ui-kit/Icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from 'components/ui-kit/Tooltip';

import styles from './Token.module.scss';

const TOKEN_TYPE = 'Governance token';

export function Token() {
  const token = useAtomValue(tokenAtom);
  const isTokenLoading = useAtomValue(tokenLoadingAtom);

  const { tokenNetwork } = appConfig;
  const { decimals, address, quantity, symbol } = token || {};

  return (
    <Card className={styles.card}>
      {isTokenLoading ? (
        <Typography variant="caption2">Loading...</Typography>
      ) : (
        <>
          <div className={styles.token}>
            {token?.address ? (
              <Link
                href={`https://${tokenNetwork}.etherscan.io/token/${address}`}
                className={styles.address}
                target="_blank"
              >
                <Typography variant="caption2">{symbol}</Typography>
              </Link>
            ) : (
              <Typography variant="caption2">{symbol}</Typography>
            )}

            <Chip variant="group" color="active" className={styles.chip}>
              <Typography variant="title8">{TOKEN_TYPE}</Typography>
            </Chip>
          </div>

          <div className={styles.balance}>
            <Typography variant="title1">
              {quantity &&
                (address
                  ? quantity
                  : formatBalance(quantity, {
                      decimals: decimals || 0,
                      withSi: false,
                      forceUnit: '-'
                    }))}
            </Typography>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={styles['hint-balance-icon']}>
                    <Icon
                      name="eye-open"
                      size="xs"
                      className={styles['hint-balance-icon']}
                    />
                  </span>
                </TooltipTrigger>
                {address ? (
                  <TooltipContent>{quantity}</TooltipContent>
                ) : (
                  <TooltipContent>
                    {decimals
                      ? (Number(quantity) / Number(10 ** decimals)).toFixed(
                          decimals
                        )
                      : quantity}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </>
      )}
    </Card>
  );
}
