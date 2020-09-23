export class TradeWorkflowSpecs {
  constructor(
    public manualApproval: boolean,
    public listedExecution: boolean,
    public nonListedFills: boolean
  ) {}
}

export class TradeWorkflowSpecsFromApi {
  constructor(
    public manualapproval: string,
    public listedexecution: string,
    public nonlistedfills: string
  ) {}
}
