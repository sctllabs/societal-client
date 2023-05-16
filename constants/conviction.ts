export enum ConvictionOptions {
  'No Conviction - Vote worth 10% of token amount. No lock on tokens' = 'None',
  '1x voting balance, locked for 1x enactment' = 'Locked1x',
  '2x voting balance, locked for 2x enactment' = 'Locked2x',
  '3x voting balance, locked for 4x enactment' = 'Locked3x',
  '4x voting balance, locked for 8x enactment' = 'Locked4x',
  '5x voting balance, locked for 16x enactment' = 'Locked5x',
  '6x voting balance, locked for 32x enactment' = 'Locked6x'
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
