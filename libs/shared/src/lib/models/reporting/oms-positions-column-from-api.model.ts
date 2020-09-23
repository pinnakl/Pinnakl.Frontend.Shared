export class OmsAndPositionsColumnFromApi {
  constructor(
    public captionfrom: string,
    public datatype: string,
    public defaultfilter: string,
    public isaggregating: string,
    public isascendingbydefault: string,
    public isdescendingbydefault: string,
    public isgroupedbydefault: string,
    public id: string,
    public name: string,
    public isvisiblebydefault: string
  ) {}
}
