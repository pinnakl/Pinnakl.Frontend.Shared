export class FxRate {
  constructor(
    public id: number,
    public currencyId: number,
    public priceDate: Date,
    public fxRate: number
  ) {}
}

export class FxRateFromApi {
  constructor(
    public id: string,
    public currencyid: string,
    public pricedate: string,
    public fxrate: string
  ) {}
}
