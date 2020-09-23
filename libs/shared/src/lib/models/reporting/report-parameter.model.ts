export class ReportParameter {
  constructor(
    public caption: string,
    public defaultValue: string | number | Date,
    public id: number,
    public name: string,
    public required: boolean,
    public type: string,
    public value: string | number | Date
  ) {}
}
