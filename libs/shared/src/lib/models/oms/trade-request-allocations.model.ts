export class TradeRequestAllocation {
  constructor(
    public id: number,
    public tradeRequestId: number,
    public accountId: number,
    public quantity: number
  ) {}
}

export class TradeRequestAllocationFromAPI {
  constructor(
    public id: string,
    public traderequestid: string,
    public accountid: string,
    public quantity: string
  ) {}
}
