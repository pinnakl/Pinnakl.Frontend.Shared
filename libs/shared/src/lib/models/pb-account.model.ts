export class PBAccount {
  id: number;
  accountCode: string;
  accountId: number;
  accountType: string;
  custodianName: string;
  custodianId: number;
  custodianCode: string;
  custodianAccountNumber: string;
}
export class PBSubAccount {
  constructor(
    public id: number,
    public accountId: number,
    public custodianCode: string,
    public PBAccountId: number,
    public subAccountCode: string
  ) {}
}
