import { useAtomValue } from 'jotai';
import { tokenAtom, tokenLoadingAtom } from 'store/token';

import { Typography } from 'components/ui-kit/Typography';
import { Card } from 'components/ui-kit/Card';
import { Chip } from 'components/ui-kit/Chip';

import styles from './Token.module.scss';

const TOKEN_TYPE = 'Governance token';

export function Token() {
  const token = useAtomValue(tokenAtom);
  const isTokenLoading = useAtomValue(tokenLoadingAtom);

  return (
    <Card className={styles.card}>
      {isTokenLoading ? (
        <Typography variant="caption2">Loading...</Typography>
      ) : (
        <>
          <div className={styles.token}>
            <Typography variant="caption2">{token?.symbol}</Typography>
            <Chip variant="group" color="active" className={styles.chip}>
              <Typography variant="title8">{TOKEN_TYPE}</Typography>
            </Chip>
          </div>

          <Typography variant="title1">
            {token.quantity &&
              Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(
                parseFloat(token.quantity)
              )}
          </Typography>
        </>
      )}
    </Card>
  );
}
