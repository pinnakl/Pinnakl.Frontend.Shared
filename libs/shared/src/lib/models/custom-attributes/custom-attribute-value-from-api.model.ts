export class CustomAttributeValueFromApi {
  public customattributeid: string;
  public id: string;
  public securityid?: string;
  public investorid?: string;
  public contactId?: string;
  public type: string;
  public value: string;
  public feature?: string;
  public mappingTable?: string;

  constructor(data: Partial<CustomAttributeValueFromApi>) {
    Object.assign(this, data);
  }
}
