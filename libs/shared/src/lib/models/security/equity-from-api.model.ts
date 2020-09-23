export class EquityFromApi {
  constructor(
    public default_indicator: string,
    public dividend_frequency: string,
    public dividend_rate: string,
    public id: string,
    public securityid: string,
    public sharesoutstanding: string
  ) {}
}
