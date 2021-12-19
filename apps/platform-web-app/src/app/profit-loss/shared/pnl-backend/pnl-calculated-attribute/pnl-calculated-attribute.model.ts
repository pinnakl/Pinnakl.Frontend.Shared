interface PnlCalculatedAttributePartial {
  accruedInterest: number;
  assetType: string;
  attributeId: number;
  countryOfIncorporation: string;
  countryOfRisk: string;
  coupon: number;
  description: string;
  dividend: number;
  id: number;
  identifier: string;
  position: number;
  price: number;
  realizedPnl: number;
  securityId: number;
  sector: string;
  secType: string;
  ticker: string;
  totalPnl: number;
  unrealizedPnl: number;
}

export type PnlCalculatedAttribute = PnlCalculatedAttributePartial & {
  [key: string]: string | number;
};
