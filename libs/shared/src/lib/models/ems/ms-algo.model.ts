export enum ASSET_TYPE {
  EQUITY = 'equity',
  OPTION = 'option'
}

export enum StrategyType {
  'SORTDMA(AMERICAS)' = 'SORTDMA(AMERICAS)',
  'NIGHTOWL(AMERICAS)' = 'NIGHTOWL(AMERICAS)'
}

export enum OptionStrategyType {
  'NIGHTOWL' = 'NIGHTOWL'
}

export enum UrgencyType {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  ULTRAHIGH = 'ULTRAHIGH'
}

export enum OptInType {
  YES = 'YES',
  NO = 'NO'
}

export enum DateOptions {
  NOW = 'NOW',
  TIME = 'TIME',
  CLOSE = 'CLOSE'
}

export enum PostMultiPassive {
  SORTNoMultipassiveInd_N = 'SORTNoMultipassiveInd_N',
  SORTNoMultipassiveInd_Y = 'SORTNoMultipassiveInd_Y'
}

export const Strategies = [
  StrategyType['SORTDMA(AMERICAS)'],
  StrategyType['NIGHTOWL(AMERICAS)']
];

export const Urgencies = [
  UrgencyType.LOW,
  UrgencyType.MEDIUM,
  UrgencyType.HIGH,
  UrgencyType.ULTRAHIGH
];

export const OptIns = [OptInType.YES, OptInType.NO];

export const OptionStrategies = [OptionStrategyType.NIGHTOWL];
