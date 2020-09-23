export class ClientReport {
  constructor(
    public id: number,
    public isPnklInternal: boolean,
    public reportCategory: string,
    public reportId: number,
    public reportName: string
  ) {}
}
