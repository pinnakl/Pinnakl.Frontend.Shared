export class TaskParam {
  constructor(
    public caption: string,
    public id: number,
    public name: string,
    public options: string[],
    public osType: string,
    public taskId: number,
    public type: string,
    public value?: any
  ) {}
}
