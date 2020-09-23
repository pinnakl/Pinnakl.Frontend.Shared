export class CdsFromApi {
  constructor(
    public businessdayconvention: string,
    public businessdays: string,
    public firstpaymentdate: string,
    public fixedratedaycount: string,
    public id: string,
    public paymentfrequency: string,
    public securityid: string,
    public spread: string,
    public terminationdate: string,
    public underlyingidentifier: string
  ) {}
}
