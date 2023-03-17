import { ProposalPeriod } from 'components/CreateDAO/types';
import { appConfig } from 'config';

const SECONDS_IN_DAY = 24 * 60 * 60;
const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_MINUTE = 60;

export function convertTimeToBlock(
  proposalPeriod: string,
  proposalPeriodType: ProposalPeriod
) {
  return (
    (parseInt(proposalPeriod, 10) *
      (proposalPeriodType === ProposalPeriod.DAYS
        ? SECONDS_IN_DAY
        : proposalPeriodType === ProposalPeriod.HOURS
        ? SECONDS_IN_HOUR
        : SECONDS_IN_MINUTE)) /
    appConfig.expectedBlockTimeInSeconds
  );
}
