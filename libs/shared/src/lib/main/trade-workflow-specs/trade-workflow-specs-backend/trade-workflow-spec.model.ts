export interface TradeWorkflowSpec {
  clientId: number;
  id: number;
  calcAum: boolean;
  listedExecution: boolean;
  manualApproval: boolean;
  nonlistedFills: boolean;
  realTimePortfolio: boolean;
  rebalanceBpsAdjVisible: boolean;
}
