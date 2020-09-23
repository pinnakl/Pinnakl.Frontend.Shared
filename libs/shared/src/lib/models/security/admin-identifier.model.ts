export class AdminIdentifier {
  constructor(
    public accountCode: string,
    public accountId: number,
    public adminCode: string,
    public adminId: number,
    public adminSecurityIdentifier: string,
    public endDate: Date,
    public id: number,
    public pinnaklSecurityId: number,
    public startDate: Date,
    public trsIndicator: boolean
  ) {}
}
