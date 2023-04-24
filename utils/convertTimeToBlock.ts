import { Period } from 'constants/period';
import { appConfig } from 'config';

const SECONDS_IN_DAY = 24 * 60 * 60;
const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_MINUTE = 60;

export function convertTimeToBlock(
  proposalPeriod: string,
  proposalPeriodType: Period
) {
  let multiplier: number;
  switch (proposalPeriodType) {
    case Period.DAYS: {
      multiplier = SECONDS_IN_DAY;
      break;
    }
    case Period.HOURS:
      multiplier = SECONDS_IN_HOUR;
      break;
    case Period.MINUTES: {
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

export function convertBlockToTime(
  proposalPeriod: number,
  proposalPeriodType: Period
) {
  let multiplier: number;
  switch (proposalPeriodType) {
    case Period.DAYS: {
      multiplier = SECONDS_IN_DAY;
      break;
    }
    case Period.HOURS:
      multiplier = SECONDS_IN_HOUR;
      break;
    case Period.MINUTES: {
      multiplier = SECONDS_IN_MINUTE;
      break;
    }
    default: {
      multiplier = SECONDS_IN_MINUTE;
    }
  }
  return (
    (proposalPeriod * appConfig.expectedBlockTimeInSeconds) /
    multiplier
  ).toString();
}
