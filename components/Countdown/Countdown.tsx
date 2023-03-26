import clsx from 'clsx';
import { useProposalCountdown } from 'hooks/useCountdown';
import { Typography, TypographyVariants } from 'components/ui-kit/Typography';

import styles from './Countdown.module.scss';

type CountdownOrientation = 'vertical' | 'horizontal';

interface CountdownProps {
  endBlock: number;
  typography: TypographyVariants;
  orientation: CountdownOrientation;
}

export function Countdown({
  endBlock,
  typography,
  orientation
}: CountdownProps) {
  const countdown = useProposalCountdown(endBlock);

  if (!countdown) {
    return null;
  }

  return (
    <span className={clsx(styles.container, styles[orientation])}>
      <Typography variant={typography}>{countdown}</Typography>
      <Typography variant="caption2">left</Typography>
    </span>
  );
}
