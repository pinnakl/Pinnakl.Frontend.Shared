export class UserReportColumn {
  constructor(
    public caption: string,
    public decimalPlaces: number,
    public filterValues: Date | number | string[],
    public groupOrder: number,
    public id: number,
    public isAggregating: boolean,
    public name: string,
    public renderingFunction: string,
    public reportColumnId: number,
    public sortAscending: boolean,
    public sortOrder: number,
    public type: string,
    public formula: string,
    public userReportId: number,
    public viewOrder: number
  ) {}
}
