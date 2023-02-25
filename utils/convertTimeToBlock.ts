import { ProposalPeriod } from 'components/CreateDAO/types';
import { appConfig } from 'config';

const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_DAYS = 24 * 60 * 60;

export function convertTimeToBlock(
  proposalPeriod: string,
  proposalPeriodType: ProposalPeriod
) {
  return (
    (parseInt(proposalPeriod, 10) *
      (proposalPeriodType === ProposalPeriod.HOURS
        ? SECONDS_IN_HOUR
        : SECONDS_IN_DAYS)) /
    appConfig.expectedBlockTimeInSeconds
  );
}
