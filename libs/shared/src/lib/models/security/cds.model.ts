export class Cds {
  constructor(
    public businessDayConvention: string,
    public businessDays: string,
    public firstPaymentDate: Date,
    public fixedRateDayCount: string,
    public id: number,
    public paymentFrequency: number,
    public securityId: number,
    public spread: number,
    public terminationDate: Date,
    public underlyingCusip: string
  ) {}
}
