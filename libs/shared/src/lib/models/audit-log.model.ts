export class AuditLog {
  constructor(
    public action: string,
    public fieldname: string,
    public id: number,
    public logTime: Date,
    public newValue: string,
    public oldValue: string,
    public pk: number,
    public tablename: string,
    public userName: string
  ) {}
}
