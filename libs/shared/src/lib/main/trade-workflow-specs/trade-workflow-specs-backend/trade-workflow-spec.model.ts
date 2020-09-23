export interface TradeWorkflowSpec {
  clientId: number;
  id: number;
  listedExecution: boolean;
  manualApproval: boolean;
  nonlistedFills: boolean;
  realTimePortfolio: boolean;
}
