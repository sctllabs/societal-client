import Image from 'next/image';

import { Typography } from 'components/ui-kit/Typography';

import styles from './Hero.module.scss';

export function Hero() {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Image src="/logo/societal-primary.svg" alt="societal-symbol" fill />
      </div>

      <Typography className={styles.title} variant="paragraph1">
        Welcome to society 3.0
      </Typography>
    </div>
  );
}
