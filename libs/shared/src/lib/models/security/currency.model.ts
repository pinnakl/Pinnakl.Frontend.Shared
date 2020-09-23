export class Currency {
  constructor(
    public forwardPrice: number,
    public id: number,
    public maturity: Date,
    public secondaryCurrencyId: number,
    public securityId: number
  ) {}
}
