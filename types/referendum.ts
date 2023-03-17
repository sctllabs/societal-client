export type Conviction =
  | 'None'
  | 'Locked1x'
  | 'Locked2x'
  | 'Locked3x'
  | 'Locked4x'
  | 'Locked5x'
  | 'Locked6x';

export type DemocracyDelegation = Readonly<{
  target: string;
  balance: string;
  conviction: Conviction;
}>;
