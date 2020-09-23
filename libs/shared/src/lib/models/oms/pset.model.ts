export class PSET {
  constructor(
    public id: number,
    public name: string,
    public bic: string,
    public currencyId,
    number,
    public currency: string
  ) {}
}

export class PSETFromAPI {
  constructor(
    public id: string,
    public name: string,
    public bic: string,
    public currencyid,
    string,
    public currency: string
  ) {}
}
