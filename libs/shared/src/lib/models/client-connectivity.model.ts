export class ClientConnectivity {
  constructor(
    public adminId: number,
    public custodianId: number,
    public entity: string,
    public entityType: string,
    public id: number,
    public reconIndicator: boolean,
    public stockLoanIndicator: boolean,
    public tradeFileIndicator: boolean
  ) {}
}
