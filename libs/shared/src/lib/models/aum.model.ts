import { Account } from './account.model';

export class AUM {
  public account: Account;
  constructor(
    public id: number,
    public accountId: number,
    public aum: number,
    public date: Date
  ) {}
}
