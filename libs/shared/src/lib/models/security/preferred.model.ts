export class Preferred {
  constructor(
    public accruingIndicator: boolean,
    public convertibleIndicator: boolean,
    public defaultIndicator: boolean,
    public dividendFrequencyId: number,
    public dividendRate: number,
    public id: number,
    public minPiece: number,
    public nominalValue: number,
    public outstandingAmount: number,
    public securityId: number
  ) {}
}
