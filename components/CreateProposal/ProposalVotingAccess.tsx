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
import styles from './CreateProposal.module.scss';

type ProposalVotingAccessProps = {
  setProposalVotingAccess: Dispatch<
    SetStateAction<ProposalVotingAccessEnum | null>
  >;
};

export function ProposalVotingAccess({
  setProposalVotingAccess
}: ProposalVotingAccessProps) {
  const onProposalVotingAccessValueChange = (
    _proposalKind: ProposalVotingAccessEnum
  ) => setProposalVotingAccess(_proposalKind);

  return (
    <Select onValueChange={onProposalVotingAccessValueChange}>
      <SelectTrigger className={styles.trigger}>
        <SelectValue placeholder={InputLabel.PROPOSAL_VOTING_ACCESS} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ProposalVotingAccessEnum).map(
          ([_proposalKey, _proposalValue]) => (
            <SelectItem value={_proposalValue} key={_proposalKey}>
              <Typography variant="button2">{_proposalValue}</Typography>
            </SelectItem>
          )
        )}
      </SelectContent>
    </Select>
  );
}
