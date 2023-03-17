import { useReferendumCountdown } from 'hooks/useCountdown';

import { Typography } from 'components/ui-kit/Typography';

import styles from './CountodnwReferendum.module.scss';

type CountdownReferendumProps = {
  launchPeriod: number;
  currentBlock: number;
};

const timeframes = ['Days', 'Hours', 'Minutes', 'Seconds'];

export function CountdownReferendum({
  launchPeriod,
  currentBlock
}: CountdownReferendumProps) {
  const countdown = useReferendumCountdown(currentBlock, launchPeriod);

  return (
    <div className={styles.container}>
      {timeframes.map((_timeframe, index) => (
        <div key={_timeframe} className={styles['time-block']}>
          <Typography className={styles.time} variant="countdown">
            {countdown[index]}
          </Typography>
          <Typography variant="label1">{_timeframe}</Typography>
        </div>
      ))}
    </div>
  );
}
