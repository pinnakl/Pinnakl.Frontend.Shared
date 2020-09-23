export class AllocationTemplate {
  constructor(
    public id: number,
    public allocationTemplateName: string,
    public accountId: number,
    public accountCode: string
  ) {}
}

export class AllocationTemplateFromAPI {
  constructor(
    public id: string,
    public allocationtemplatename: string,
    public accountid: string,
    public accountcode: string
  ) {}
}
