export class OptionFromApi {
  constructor(
    public contract_size: string,
    public id: string,
    public maturity: string,
    public option_type: string,
    public put_call_indicator: string,
    public securityid: string,
    public strike: string,
    public underlyingsecurityid: string
  ) {}
}
