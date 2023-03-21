import clsx from 'clsx';
import { useReferendumCountdown } from 'hooks/useCountdown';

import { Typography } from 'components/ui-kit/Typography';

import styles from './CountodnwReferendum.module.scss';

type CountdownReferendumProps = {
  launchPeriod: number;
  currentBlock: number;
  active: boolean;
};

const timeframes = ['Days', 'Hours', 'Minutes', 'Seconds'];

export function CountdownReferendum({
  launchPeriod,
  currentBlock,
  active
}: CountdownReferendumProps) {
  const countdown = useReferendumCountdown(currentBlock, launchPeriod);

  return (
    <div className={styles.container}>
      {timeframes.map((_timeframe, index) => (
        <div key={_timeframe} className={styles['time-block']}>
          <Typography
            className={clsx(styles.time, { [styles.active]: active })}
            variant="countdown"
          >
            {countdown[index]}
          </Typography>
          <Typography variant="label1">{_timeframe}</Typography>
        </div>
      ))}
    </div>
  );
}
