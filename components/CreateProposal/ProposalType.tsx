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

import {
  BountyProposalEnum,
  InputLabel,
  ProposalEnum,
  ProposalVariant
} from './types';

type ProposalTypeProps = {
  proposalVariant: ProposalVariant;
  proposalType: ProposalEnum | BountyProposalEnum | undefined;
  setProposalType: Dispatch<
    SetStateAction<ProposalEnum | BountyProposalEnum | undefined>
  >;
};

export function ProposalType({
  proposalType,
  proposalVariant,
  setProposalType
}: ProposalTypeProps) {
  const currentDao = useAtomValue(currentDaoAtom);

  const onProposalTypeValueChange = (_proposalType: ProposalEnum) =>
    setProposalType(_proposalType);

  return (
    <Select
      defaultValue={proposalType}
      onValueChange={onProposalTypeValueChange}
    >
      <SelectTrigger>
        <SelectValue placeholder={InputLabel.PROPOSAL_TYPE} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(
          proposalVariant === 'proposal' ? ProposalEnum : BountyProposalEnum
        )
          .filter(([_proposalKey]) => {
            const govType = currentDao?.policy.governance?.__typename;

            switch (govType) {
              case 'OwnershipWeightedVoting':
                return _proposalKey !== 'TRANSFER_GOVERNANCE_TOKEN';
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
