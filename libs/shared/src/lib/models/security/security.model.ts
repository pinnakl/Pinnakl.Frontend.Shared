export class RTSecurity {
  constructor(
    public description: string,
    public id: number,
    public ticker: string
  ) {}
}
export class Security {
  constructor(
    public assetType: string,
    public assetTypeId: number,
    public countryOfIncorporation: string,
    public countryOfRisk: string,
    public currency: string,
    public currencyId: number,
    public cusip: string,
    public dataSourceId: number,
    public description: string,
    public id: number,
    public isin: string,
    public loanId: string,
    public manualPricingIndicator: boolean,
    public moodyRating: string,
    public multiplier: number,
    public opraCode: string,
    public organizationId: number,
    public organizationName: string,
    public organizationStatusDescription: string,
    public organizationStatusId: string,
    public organizationTicker: string,
    public privateIndicator: boolean,
    public sandpRating: string,
    public sector: string,
    public securityType: string,
    public securityTypeDescription: string,
    public securityTypeId: number,
    public sedol: string,
    public ticker: string,
    public principalFactor: number,
    public initialMargin: number,
    public maintenanceMargin: number,
    public maturity: Date,
    public underlyingsecid: number = null
  ) {}

  public identifier() {
    let identifier = this.cusip;

    if (identifier === '') {
      identifier = this.isin;
    }

    if (identifier === '') {
      identifier = this.loanId;
    }

    return identifier;
  }

  public isListed() {
    if (['equity', 'option', 'future'].indexOf(this.assetType) > -1) {
      return true;
    } else {
      return false;
    }
  }
}
