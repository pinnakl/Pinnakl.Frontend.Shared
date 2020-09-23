export class LoanFromApi {
  constructor(
    public accruing_indicator: string,
    public coupon_rate: string,
    public coupon_type: string,
    public default_indicator: string,
    public first_coupon_date: string,
    public id: string,
    public interest_basis: string,
    public maturity_date: string,
    public outstanding_amount: string,
    public payment_frequency: string,
    public securityid: string
  ) {}
}
