export class Future {
  constructor(
    public contractSize: number,
    public expirationDate: Date,
    public id: number,
    public lastTradeableDate: Date,
    public securityId: number,
    public tickSize: number,
    public tickValue: number,
    public valueOf1Pt: number,
    public initialMargin: number,
    public maintenanceMargin: number
  ) {}
}
