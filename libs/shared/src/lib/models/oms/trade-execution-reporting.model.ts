export class TradeExecutionReporting {
  constructor(
    public id: number,
    public sendToBroker: boolean,
    public sendToAdmin: boolean,
    public sendToCustodian: boolean
  ) {}
}
