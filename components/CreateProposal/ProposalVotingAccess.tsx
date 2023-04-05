import { Dispatch, SetStateAction } from 'react';

import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';

import { Typography } from 'components/ui-kit/Typography';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from 'components/ui-kit/Select';

import { InputLabel, ProposalVotingAccessEnum } from './types';

type ProposalVotingAccessProps = {
  setProposalVotingAccess: Dispatch<
    SetStateAction<ProposalVotingAccessEnum | null>
  >;
};

export function ProposalVotingAccess({
  setProposalVotingAccess
}: ProposalVotingAccessProps) {
  const currentDao = useAtomValue(currentDaoAtom);

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
          .filter(([_proposalKey]) => {
            const govType = currentDao?.policy.governance.__typename;
            switch (govType) {
              case 'OwnershipWeightedVoting':
                return _proposalKey !== 'Democracy';
              case 'GovernanceV1':
                return _proposalKey !== 'EthGovernance';
              default:
                return true;
            }
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
