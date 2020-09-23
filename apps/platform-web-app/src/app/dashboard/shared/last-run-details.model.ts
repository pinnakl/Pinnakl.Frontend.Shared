export class LastRunDetails {
  constructor(
    public listOfProps: object,
    public runBy: string,
    public runByFirstName: string,
    public runByLastName: string,
    public runtime: Date,
    public taskInstanceQueueId: number,
    public taskRequestId: number
  ) {}
}
