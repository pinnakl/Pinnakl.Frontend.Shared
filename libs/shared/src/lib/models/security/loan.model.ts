export class Loan {
  constructor(
    public accruingIndicator: boolean,
    public couponRate: number,
    public couponTypeId: number,
    public defaultIndicator: boolean,
    public firstCouponDate: Date,
    public id: number,
    public interestBasisId: number,
    public maturityDate: Date,
    public outstandingAmount: number,
    public paymentFrequencyId: number,
    public securityId: number
  ) {}
}
