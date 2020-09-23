export class ReportColumn {
  constructor(
    public caption: string,
    public convertToBaseCurrency: boolean,
    public decimalPlaces: number,
    public filterValues: Date | number | string[],
    public groupOrder: number,
    public id: number,
    public isAggregating: boolean,
    public name: string,
    public renderingFunction: string,
    public reportId: number,
    public sortAscending: boolean,
    public sortOrder: number,
    public type: string,
    public formula: string,
    public viewOrder: number
  ) {}
}
