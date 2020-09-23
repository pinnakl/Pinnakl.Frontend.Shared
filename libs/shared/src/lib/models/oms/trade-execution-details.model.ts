export class TradeExecutionOrderDetails {
  constructor(
    public id: number,
    public tradeRequestId: number,
    public orderStatus: string,
    public orderType: boolean,
    public orderQty: number,
    public limitPrice: number
  ) {}
}

export class TradeExecutionOrderDetailsFromApi {
  constructor(
    public id: number,
    public tradeRequestId: string,
    public orderStatus: string,
    public orderType: string,
    public orderqty: string,
    public limitprice: string
  ) {}
}
