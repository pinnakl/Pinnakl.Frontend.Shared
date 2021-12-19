export class LastRunDetails {
  constructor(
    public listOfProps: any,
    public runBy: string,
    public runByFirstName: string,
    public runByLastName: string,
    public runtime: Date,
    public taskInstanceQueueId: number,
    public taskRequestId: number
  ) {}
}
