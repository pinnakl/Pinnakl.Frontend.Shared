export class TaskStatusDetailFromApi {
  constructor(
    public heading: string,
    public lastrundetails: string,
    public result: string,
    public taskid: string
  ) {}
}
