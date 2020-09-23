export class FutureFromApi {
  constructor(
    public contract_size: string,
    public expiration_date: string,
    public id: string,
    public last_tradeable_date: string,
    public securityid: string,
    public tick_size: string,
    public tick_value: string,
    public value_of_1_pt: string,
    public initialmargin: string,
    public maintenancemargin: string
  ) {}
}
