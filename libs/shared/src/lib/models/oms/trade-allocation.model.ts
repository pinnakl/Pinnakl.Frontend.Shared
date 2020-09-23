export class TradeAllocation {
  constructor(
    public id: number,
    public tradeId: number,
    public accountId: number,
    public custodianId: number,
    public quantity: number,
    public subAccountId?: number
  ) {}
}
