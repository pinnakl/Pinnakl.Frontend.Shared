export class CurrencyFromApi {
  constructor(
    public forwardprice: string,
    public id: string,
    public maturity: string,
    public secondarycurrencyid: string,
    public securityid: string
  ) {}
}
