export class OrganizationFromApi {
  constructor(
    public country_code: string,
    public id: string,
    public name: string,
    public risk_country_code: string,
    public status_id: string,
    public ticker: string
  ) {}
}
