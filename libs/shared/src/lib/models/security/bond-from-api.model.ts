export class BondFromApi {
  constructor(
    public accruing_indicator: string,
    public bond144a_indicator: string,
    public call_indicator: string,
    public convertible_indicator: string,
    public coupon_rate: string,
    public coupon_type: string,
    public default_indicator: string,
    public first_accrual_date: string,
    public first_coupon_date: string,
    public id: string,
    public interest_basis: string,
    public issue_amount: string,
    public maturity_date: string,
    public min_piece: string,
    public nominal_value: string,
    public outstanding_amount: string,
    public payment_frequency: string,
    public pik_indicator: string,
    public principal_factor: string,
    public put_indicator: string,
    public securityid: string,
    public sink_indicator: string,
    public strippable_indicator: string,
    public underlyingsecurityid: string
  ) {}
}
