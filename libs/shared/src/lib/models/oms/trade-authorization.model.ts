export class TradeAuthorization {
  constructor(
    public id: number,
    public tradeRequestId: number,
    public asOf: string,
    public userId: number
  ) {}
}

export class TradeAuthorizationFromAPI {
  constructor(
    public id: string,
    public traderequestid: string,
    public asof: string,
    public userid: string
  ) {}
}
