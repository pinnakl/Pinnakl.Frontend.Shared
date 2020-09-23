export class SecurityMarket {
  constructor(
    public activeTradingIndicator: boolean,
    public countryOfQuotation: string,
    public id: number,
    public marketId: number,
    public mic: string,
    public primaryMarketIndicator: boolean,
    public securityId: number
  ) {}
}
