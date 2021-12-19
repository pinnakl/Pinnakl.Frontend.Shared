export class TradeRequestLog {
  constructor(
    public id: number,
    public accruedInterest: number,
    public action: string,
    public asOfDate: Date,
    public brokerId: number,
    public commission: number,
    public currencyId: number,
    public firstName: string,
    public fxRate: number,
    public lastName: string,
    public netMoneyBook: number,
    public netMoneyLocal: number,
    public price: number,
    public quantity: number,
    public secFee: number,
    public optionFee: number,
    public securityId: number,
    public settleDate: Date,
    public tradeDate: Date,
    public tranType: string,
    public userId: number
  ) {}
}
