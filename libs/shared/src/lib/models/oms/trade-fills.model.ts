export class ExecutionReport {
  constructor(
    public id: number,
    public pnklPlacementId: number,
    public orderStatus: string,
    public orderQty: number,
    public orderPrice: number,
    public asOf: Date,
    public lastQty: number,
    public cumQty: number,
    public leftQty: number,
    public avgPrc: number,
    public fillPrc: number
  ) {}
}

export class ExecutionReportFromApi {
  constructor(
    public Id: string,
    public PnklPlacementId: string,
    public pnklorigplacementid: string,
    public Status: string,
    public OrderQty: string,
    public Timestamp: string,
    public LastQty: string,
    public CumQty: string,
    public LeftQty: string,
    public AvgPrc: string,
    public FillPrc: string
  ) {}
}
