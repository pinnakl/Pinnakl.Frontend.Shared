export class TaskHistory {
  constructor(
    public failureParams: string,
    public params: string,
    public runby: string,
    public runtime: Date,
    public status: string,
    public successParams: string,
    public taskInstanceQueueId: string,
    public taskRequestId: string
  ) {}
}
