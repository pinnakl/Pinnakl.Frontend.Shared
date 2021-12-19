
export class SecurityMarketFlattened {
  constructor(
    public securityMarketId: number,
    public securityId: number,
    public marketId: number,
    public assetType: string,
    public assetTypeId: number,
    public currency: string,
    public currencyId: number,
    public cusip: string,
    public description: string,
    public isin: string,
    public loanId: string,
    public multiplier: number,
    public opraCode: string,
    public privateIndicator: boolean,
    public secType: string,
    public secTypeId: number,
    public sedol: string,
    public ticker: string,
    public position: string
  ) {}
}

export class SecurityMarketFlattenedFromAPI {
  constructor(
    public securitymarketid: string,
    public securityid: string,
    public marketid: string,
    public assettype: string,
    public assettypeid: string,
    public currency: string,
    public currencyid: string,
    public cusip: string,
    public description: string,
    public isin: string,
    public loanid: string,
    public multiplier: string,
    public opracode: string,
    public privateindicator: string,
    public sectype: string,
    public sectypeid: string,
    public sedol: string,
    public ticker: string,
    public position: string
  ) {}
}
