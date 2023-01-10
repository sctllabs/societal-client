import { useCountdown } from 'hooks/useCountdown';
import { Typography, TypographyVariants } from 'components/ui-kit/Typography';

interface CountdownProps {
  end: number;
  typography: TypographyVariants;
}

export function Countdown({ end, typography }: CountdownProps) {
  const countdown = useCountdown(end);

  return <Typography variant={typography}>{countdown}</Typography>;
}
