import { Dispatch, SetStateAction } from 'react';

import { Typography } from 'components/ui-kit/Typography';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from 'components/ui-kit/Select';

import { InputLabel, ProposalEnum } from './types';
import styles from './CreateProposal.module.scss';

type ProposalTypeProps = {
  setProposalType: Dispatch<SetStateAction<ProposalEnum | null>>;
};

export function ProposalType({ setProposalType }: ProposalTypeProps) {
  const onProposalTypeValueChange = (_proposalType: ProposalEnum) =>
    setProposalType(_proposalType);

  return (
    <Select onValueChange={onProposalTypeValueChange}>
      <SelectTrigger className={styles.trigger}>
        <SelectValue placeholder={InputLabel.PROPOSAL_TYPE} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ProposalEnum).map(([_proposalKey, _proposalValue]) => (
          <SelectItem value={_proposalValue} key={_proposalKey}>
            <Typography variant="button2">{_proposalValue}</Typography>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
