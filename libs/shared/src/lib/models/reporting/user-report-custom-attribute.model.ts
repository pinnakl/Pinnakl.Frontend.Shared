export class UserReportCustomAttribute {
  constructor(
    public customAttributeId: number,
    public filterValues: Date | number | string[],
    public groupOrder: number,
    public id: number,
    public isAggregating: boolean,
    public name: string,
    public sortAscending: boolean,
    public sortOrder: number,
    public type: string,
    public userReportId: number,
    public viewOrder: number
  ) {}
}
