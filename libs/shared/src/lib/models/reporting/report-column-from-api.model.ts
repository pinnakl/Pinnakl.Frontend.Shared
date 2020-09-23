export class ReportColumnFromApi {
  constructor(
    public caption: string,
    public converttobasecurrency: string,
    public decimalplaces: string,
    public filtervalues: string,
    public grouporder: string,
    public id: string,
    public isaggregating: string,
    public name: string,
    public renderingfunction: string,
    public reportid: string,
    public sortascending: string,
    public sortorder: string,
    public type: string,
    public formula: string,
    public vieworder: string
  ) {}
}
