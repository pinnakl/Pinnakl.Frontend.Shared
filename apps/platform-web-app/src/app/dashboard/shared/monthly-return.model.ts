export class MonthlyReturn {
  constructor(
    public accountId: number,
    public id: number,
    public mtdReturn: number,
    public ytdReturn: number
  ) {}
}
