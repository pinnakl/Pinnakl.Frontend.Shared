export class ClientReportColumnFromApi {
  constructor(
    public caption: string,
    public clientreportid: string,
    public decimalplaces: string,
    public filtervalues: string,
    public grouporder: string,
    public id: string,
    public isaggregating: string,
    public name: string,
    public reportcolumnid: string,
    public sortascending: string,
    public sortorder: string,
    public type: string,
    public vieworder: string
  ) {}
}
