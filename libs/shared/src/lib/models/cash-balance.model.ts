import { Account } from './account.model';
import { Custodian } from './oms/custodian.model';

export class CashBalance {
  public account: Account;
  public custodian: Custodian;
  constructor(
    public id: number,
    public date: Date,
    public accountId: number,
    public custodianId: number,
    public currency: string,
    public amount: number,
    public amountUSD: number
  ) {}
}
