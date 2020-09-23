export class CustomAttributeOMS {
  public customValues: any[];
  constructor(
    public id: number,
    public colName: string,
    public colMappedTo: string
  ) {}
}
