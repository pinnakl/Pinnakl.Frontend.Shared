export class CustomAttributeValue {
  public id: string;
  public customAttributeId?: number;
  public securityId?: number;
  public investorId?: number;
  public contactId?: number;
  public type: string;
  public value: Date | number | string;
  constructor(data: Partial<CustomAttributeValue>) {
    Object.assign(this, data);
  }
}
