export class TRSFromApi {
  constructor(
    public id: string,
    public securityid: string,
    public startdate: string,
    public effectivedate: string,
    public terminationdate: string,
    public baserate: string,
    public spread: string,
    public daycount: string,
    public swaprefno: string,
    public resetindicator: string,
    public underlyingsecurityid: string
  ) {}
}
