export class AuditLogFromApi {
  constructor(
    public action: string,
    public fieldname: string,
    public id: string,
    public logtime: string,
    public newvalue: string,
    public oldvalue: string,
    public pk: string,
    public tablename: string,
    public username: string
  ) {}
}
