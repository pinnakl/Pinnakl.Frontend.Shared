export class FundFromApi {
  constructor(
    public dividend_frequency: string,
    public dividend_rate: string,
    public id: string,
    public securityid: string,
    public sharesoutstanding: string
  ) {}
}
