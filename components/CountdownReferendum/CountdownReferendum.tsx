import { useCountdown } from 'hooks/useCountdown';

import styles from './CountodnwReferendum.module.scss';
import { Typography } from '../ui-kit/Typography';

type CountdownReferendumProps = {
  end: number;
};

const timeframes = ['Days', 'Hours', 'Minutes', 'Seconds'];

export function CountdownReferendum({ end }: CountdownReferendumProps) {
  const countdown = useCountdown(end, true);

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
