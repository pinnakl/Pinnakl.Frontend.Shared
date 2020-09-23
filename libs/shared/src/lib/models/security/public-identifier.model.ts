export class PublicIdentifier {
  constructor(
    public endDate: Date,
    public id: number,
    public identifier: string,
    public identifierType: string,
    public marketId: number,
    public securityId: number,
    public startDate: Date
  ) {}
}
