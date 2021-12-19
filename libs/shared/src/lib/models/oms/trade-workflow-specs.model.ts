export class TradeWorkflowSpecs {
  constructor(
    public id: string,
    public manualApproval: boolean,
    public listedExecution: boolean,
    public nonListedFills: boolean,
    public locatesIntegration: boolean,
    public minIncrement: boolean,
    public quantityAsPct: number,
    public onlyViewTodayActivity: boolean,
    public defaultAllocationAccts: string
  ) {}
}

export class TradeWorkflowSpecsFromApi {
  constructor(
    public id: string,
    public manualapproval: string,
    public locatesintegration: string,
    public listedexecution: string,
    public nonlistedfills: string,
    public minincrement: string,
    public quantityaspct: string,
    public onlyviewtodayactivity: string,
    public defaultallocationaccts: string
  ) {}
}
