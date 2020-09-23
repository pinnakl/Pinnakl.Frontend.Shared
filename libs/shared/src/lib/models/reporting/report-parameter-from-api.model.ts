export class ReportParameterFromApi {
  constructor(
    public caption: string,
    public defaultvalue: string,
    public id: string,
    public name: string,
    public required: string,
    public type: string
  ) {}
}
