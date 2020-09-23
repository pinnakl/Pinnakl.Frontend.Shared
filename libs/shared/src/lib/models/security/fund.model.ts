export class Fund {
  constructor(
    public dividendFrequencyId: number,
    public dividendRate: number,
    public id: number,
    public securityId: number,
    public sharesOutstanding: number
  ) {}
}
