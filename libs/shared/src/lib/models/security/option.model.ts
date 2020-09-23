export class Option {
  constructor(
    public contractSize: number,
    public id: number,
    public maturity: Date,
    public optionType: string,
    public putCallIndicator: string,
    public securityId: number,
    public strike: number,
    public underlyingSecurityId: number
  ) {}
}
