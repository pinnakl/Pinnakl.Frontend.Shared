export class Equity {
  constructor(
    public defaultIndicator: boolean,
    public dividendFrequencyId: number,
    public dividendRate: number,
    public id: number,
    public securityId: number,
    public sharesOutstanding: number
  ) {}
}
