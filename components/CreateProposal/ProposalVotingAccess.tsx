import { Dispatch, SetStateAction } from 'react';

import { Typography } from 'components/ui-kit/Typography';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from 'components/ui-kit/Select';

import { InputLabel, ProposalVotingAccessEnum } from './types';
import { Dao } from 'types';

type ProposalVotingAccessProps = {
  currentDao: Dao | null;
  setProposalVotingAccess: Dispatch<
    SetStateAction<ProposalVotingAccessEnum | null>
  >;
};

export function ProposalVotingAccess({
  currentDao,
  setProposalVotingAccess
}: ProposalVotingAccessProps) {
  const onProposalVotingAccessValueChange = (
    _proposalKind: ProposalVotingAccessEnum
  ) => setProposalVotingAccess(_proposalKind);

  return (
    <Select onValueChange={onProposalVotingAccessValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={InputLabel.PROPOSAL_VOTING_ACCESS} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ProposalVotingAccessEnum)
          .filter(([_proposalKey, _proposalValue]) => {
            if (
              currentDao?.policy.governance.__typename ===
              'OwnershipWeightedVoting'
            ) {
              return _proposalKey !== 'Democracy';
            } else if (
              currentDao?.policy.governance.__typename === 'GovernanceV1'
            ) {
              return _proposalKey !== 'OwnershipWeightedVoting';
            }

            return true;
          })
          .map(([_proposalKey, _proposalValue]) => (
            <SelectItem value={_proposalValue} key={_proposalKey}>
              <Typography variant="button2">{_proposalValue}</Typography>
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}
