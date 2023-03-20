import { ProposalPeriod } from 'components/CreateDAO/types';
import { appConfig } from 'config';

const SECONDS_IN_DAY = 24 * 60 * 60;
const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_MINUTE = 60;

export function convertTimeToBlock(
  proposalPeriod: string,
  proposalPeriodType: ProposalPeriod
) {
  let multiplier: number;
  switch (proposalPeriodType) {
    case ProposalPeriod.DAYS: {
      multiplier = SECONDS_IN_DAY;
      break;
    }
    case ProposalPeriod.HOURS:
      multiplier = SECONDS_IN_HOUR;
      break;
    case ProposalPeriod.MINUTES: {
      multiplier = SECONDS_IN_MINUTE;
      break;
    }
    default: {
      multiplier = SECONDS_IN_MINUTE;
    }
  }
  return (
    (parseInt(proposalPeriod, 10) * multiplier) /
    appConfig.expectedBlockTimeInSeconds
  );
}
