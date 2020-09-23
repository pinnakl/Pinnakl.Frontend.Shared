export class UserReportIdcColumn {
  constructor(
    public caption: string,
    public filterValues: Date | number | string[],
    public groupOrder: number,
    public id: number,
    public idcColumnId: number,
    public isAggregating: boolean,
    public name: string,
    public sortAscending: boolean,
    public sortOrder: number,
    public type: string,
    public userReportId: number,
    public viewOrder: number
  ) {}
}
