export class PbIdentifier {
  constructor(
    public custodianCode: string,
    public custodianId: number,
    public externalIdentifier: string,
    public id: number,
    public pinnaklSecurityId: number
  ) {}
}
