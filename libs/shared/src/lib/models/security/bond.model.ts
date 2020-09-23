export class Bond {
  constructor(
    public accruingIndicator: boolean,
    public bond144aIndicator: boolean,
    public callIndicator: boolean,
    public convertibleIndicator: boolean,
    public couponRate: number,
    public couponTypeId: number,
    public defaultIndicator: boolean,
    public firstAccrualDate: Date,
    public firstCouponDate: Date,
    public id: number,
    public interestBasisId: number,
    public issueAmount: number,
    public maturityDate: Date,
    public minPiece: number,
    public nominalValue: number,
    public outstandingAmount: number,
    public paymentFrequencyId: number,
    public pikIndicator: boolean,
    public principalFactor: number,
    public putIndicator: boolean,
    public securityId: number,
    public sinkIndicator: boolean,
    public strippableIndicator: boolean,
    public underlyingSecurityId: number
  ) {}
}
