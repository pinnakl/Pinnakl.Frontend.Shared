export class UserReportCustomAttributeFromApi {
  constructor(
    public customattributeid: string,
    public filtervalues: string,
    public grouporder: string,
    public id: string,
    public isaggregating: string,
    public name: string,
    public sortascending: string,
    public sortorder: string,
    public type: string,
    public userreportid: string,
    public vieworder: string
  ) {}
}
