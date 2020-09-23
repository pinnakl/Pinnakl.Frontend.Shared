export class CustomAttributeValue {
  constructor(
    public customAttributeId: number,
    public id: number,
    public securityId: number,
    public type: string,
    public value: Date | number | string
  ) {}
}
