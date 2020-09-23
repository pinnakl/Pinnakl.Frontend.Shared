export class ClientReportColumn {
  constructor(
    public caption: string,
    public clientReportId: number,
    public decimalPlaces: number,
    public filterValues: Date | number | string[],
    public groupOrder: number,
    public id: number,
    public isAggregating: boolean,
    public name: string,
    public reportColumnId: number,
    public sortAscending: boolean,
    public sortOrder: number,
    public type: string,
    public viewOrder: number,
  ) {}
}
