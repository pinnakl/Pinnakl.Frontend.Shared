export class SecurityMarketFromApi {
  constructor(
    public active_trading_indicator: string,
    public country_of_quotation: string,
    public id: string,
    public marketid: string,
    public mic: string,
    public primary_market_indicator: string,
    public securityid: string
  ) {}
}
