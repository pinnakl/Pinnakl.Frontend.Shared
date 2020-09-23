export class Task {
  constructor(
    public category: string,
    public description: string,
    public frontEndIndicator: boolean,
    public id: number,
    public name: string
  ) {}
}
