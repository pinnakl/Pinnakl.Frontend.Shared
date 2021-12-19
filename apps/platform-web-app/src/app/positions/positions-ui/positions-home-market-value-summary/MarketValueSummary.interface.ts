export interface MarketValueSummary {
  lmvY: number;
  lmvT: number;
  smvY: number;
  smvT: number;
  pnlY: number;
  pnlT: number;
  cashY: number;
  cashT: number;
}

export interface MarketValueSummaryElement {
  name: string;
  today: number;
  yesterday: number;
}
