export class UserReport {
  constructor(
    public clientReportId: number,
    public id: number,
    public isPnklInternal: boolean,
    public reportCategory: string,
    public reportName: string,
    public reportId: number,
    public userId: number
  ) {}
}
