export enum ConvictionOptions {
  'No Conviction' = 'None',
  '1x voting balance, locked for 1x enactment (0.00 days)' = 'Locked1x',
  '2x voting balance, locked for 2x enactment (0.00 days)' = 'Locked2x',
  '3x voting balance, locked for 4x enactment (0.00 days)' = 'Locked3x',
  '4x voting balance, locked for 8x enactment (0.00 days)' = 'Locked4x',
  '5x voting balance, locked for 16x enactment (0.01 days)' = 'Locked5x',
  '6x voting balance, locked for 32x enactment (0.01 days)' = 'Locked6x'
}

export enum ConvictionToEth {
  'None' = 0,
  'Locked1x' = 1,
  'Locked2x' = 2,
  'Locked3x' = 3,
  'Locked4x' = 4,
  'Locked5x' = 5,
  'Locked6x' = 6
}
