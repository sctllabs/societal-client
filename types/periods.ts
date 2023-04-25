export type GovernancePeriodAtom =
  | 'proposalPeriodAtom'
  | 'votingPeriodAtom'
  | 'enactmentPeriodAtom'
  | 'voteLockingPeriodAtom'
  | 'launchPeriodAtom';

export type BountyPeriodAtom =
  | 'updatePeriodAtom'
  | 'awardDelayPeriodAtom'
  | 'spendPeriodAtom';

export type GenericPeriodInputType<Atom> = {
  title: string;
  subtitle: string;
  label: string;
  atom: Atom;
};

export type ProposalPeriodInputType =
  GenericPeriodInputType<GovernancePeriodAtom>;
export type BountyPeriodInputType = GenericPeriodInputType<BountyPeriodAtom>;
