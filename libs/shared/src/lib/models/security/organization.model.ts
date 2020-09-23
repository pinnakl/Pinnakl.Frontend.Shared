export class Organization {
  constructor(
    public countryCode: string,
    public id: number,
    public name: string,
    public riskCountryCode: string,
    public statusId: number,
    public ticker: string
  ) {}
}
