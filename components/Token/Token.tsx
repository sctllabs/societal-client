import { useAtomValue } from 'jotai';
import Link from 'next/link';

import { tokenAtom, tokenLoadingAtom } from 'store/token';
import { appConfig } from 'config';
import { formatBalance } from 'utils/formatBalance';

import { Typography } from 'components/ui-kit/Typography';
import { Card } from 'components/ui-kit/Card';
import { Chip } from 'components/ui-kit/Chip';

import styles from './Token.module.scss';

const TOKEN_TYPE = 'Governance token';

export function Token() {
  const token = useAtomValue(tokenAtom);
  const isTokenLoading = useAtomValue(tokenLoadingAtom);

  const { tokenNetwork } = appConfig;

  return (
    <Card className={styles.card}>
      {isTokenLoading ? (
        <Typography variant="caption2">Loading...</Typography>
      ) : (
        <>
          <div className={styles.token}>
            {token?.address ? (
              <Link
                href={`https://${tokenNetwork}.etherscan.io/token/${token.address}`}
                className={styles.address}
                target="_blank"
              >
                <Typography variant="caption2">{token?.symbol}</Typography>
              </Link>
            ) : (
              <Typography variant="caption2">{token?.symbol}</Typography>
            )}

            <Chip variant="group" color="active" className={styles.chip}>
              <Typography variant="title8">{TOKEN_TYPE}</Typography>
            </Chip>
          </div>

          <Typography variant="title1">
            {token.quantity && formatBalance(token.quantity, token.decimals)}
          </Typography>
        </>
      )}
    </Card>
  );
}
