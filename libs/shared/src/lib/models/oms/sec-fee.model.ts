export class SecFee {
  constructor(
    public id: number,
    public assetTypeId: number,
    public feesPerShare: number,
    public startDate: Date,
    public endDate: Date
  ) {}
}

export class SecFeeFromAPI {
  constructor(
    public id: string,
    public assettypeid: string,
    public fees: string,
    public startdate: string,
    public enddate: string
  ) {}
}
