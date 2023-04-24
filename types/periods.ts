export type BasicPeriodAtom = 'proposalPeriodAtom' | 'spendPeriodAtom';

export type GovernancePeriodAtom =
  | 'votingPeriodAtom'
  | 'enactmentPeriodAtom'
  | 'voteLockingPeriodAtom'
  | 'launchPeriodAtom';

export type BountyPeriodAtom = 'updatePeriodAtom' | 'awardDelayPeriodAtom';

export type GenericPeriodInputType<Atom> = {
  title: string;
  subtitle: string;
  label: string;
  atom: Atom;
};

export type GovernancePeriodInputType =
  GenericPeriodInputType<GovernancePeriodAtom>;
export type BasicPeriodInputType = GenericPeriodInputType<BasicPeriodAtom>;
export type BountyPeriodInputType = GenericPeriodInputType<BountyPeriodAtom>;

export type GenericPeriodValue<Atom> = {
  _atom: Atom;
  _value: number;
};
export type BasicPeriodValue = GenericPeriodValue<BasicPeriodAtom>;
export type GovernancePeriodValue = GenericPeriodValue<GovernancePeriodAtom>;
export type BountyPeriodValue = GenericPeriodValue<BountyPeriodAtom>;
