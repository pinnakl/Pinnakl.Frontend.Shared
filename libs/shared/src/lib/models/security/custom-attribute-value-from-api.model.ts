export class CustomAttributeValueFromApi {
  constructor(
    public customattributeid: string,
    public id: string,
    public securityid: string,
    public type: string,
    public value: string
  ) {}
}
