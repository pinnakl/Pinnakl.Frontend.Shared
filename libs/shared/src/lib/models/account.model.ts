export class Account {
  constructor(
    public id: string,
    public accountCode: string,
    public accountNum: string,
    public name: string,
    public isPrimaryForReturns: boolean,
    public orderOfImportance: string
  ) {}
}
